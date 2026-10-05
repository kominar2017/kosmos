/* =========================================================
   SKY 2D — небо, звёзды, частицы, туманности, солнце, облака
   FPS-независимое движение + плавное угасание неба (80-170 км)
   ========================================================= */

/* ---------- ОБЛАКА В НЕБЕ ---------- */
function initClouds() {
  skyClouds = [];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const puffs = [];
    const puffCount = 3 + Math.floor(Math.random() * 3);
    for (let p = 0; p < puffCount; p++) {
      puffs.push({
        dx: (Math.random() - 0.5) * 2.2,
        dy: (Math.random() - 0.5) * 0.35,
        rx: 1.0 + Math.random() * 0.8,
        ry: 0.25 + Math.random() * 0.15,
        alpha: 0.5 + Math.random() * 0.5
      });
    }
    const depth = 0.4 + Math.random() * 0.6;
    skyClouds.push({
      x: Math.random() * (W + 600) - 300,
      y: Math.random() * H * 0.55 + H * 0.02,
      scale: (40 + Math.random() * 80) * depth,
      speed: (20 + Math.random() * 40) * depth,
      alpha: (0.06 + Math.random() * 0.10) * depth,
      depth,
      puffs
    });
  }
}

function drawSkyClouds(km, dt) {
  const fade = 1 - Math.min(1, Math.max(0, (km - 130) / 50));
  if (fade <= 0.02) return;

  const dtNorm = (dt || 0.016) / 0.016;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (const c of skyClouds) {
    c.x += c.speed * 0.016 * dtNorm;
    if (c.x - c.scale * 4 > W + 300) {
      c.x = -c.scale * 4 - 300;
      c.y = Math.random() * H * 0.55 + H * 0.02;
    }

    for (const p of c.puffs) {
      const px = c.x + p.dx * c.scale;
      const py = c.y + p.dy * c.scale;
      const rx = p.rx * c.scale;
      const ry = p.ry * c.scale;

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(rx / ry, 1);

      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0.1, ry));
      const a = c.alpha * p.alpha * fade;
      grd.addColorStop(0,   `rgba(255, 255, 255, ${a})`);
      grd.addColorStop(0.5, `rgba(245, 250, 255, ${a * 0.5})`);
      grd.addColorStop(1,   `rgba(230, 240, 255, 0)`);

      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0.1, ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

/* ---------- ЧАСТИЦЫ ---------- */
function initParticles() {
  particles = [];
  const count = 90;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: (Math.random() - 0.5) * W * 2.0,
      y: (Math.random() - 0.5) * H * 2.0,
      z: Math.random() * 1000 + 1
    });
  }
}

function drawParticles(dt) {
  const speedMul = 2.2 + starsSpeed * 0.9;
  const dtNorm = (dt || 0.016) / 0.016;

  for (const star of particles) {
    const oldZ = star.z;
    star.z -= speedMul * dtNorm;
    if (star.z <= 0) {
      star.x = (Math.random() - 0.5) * W * 2.0;
      star.y = (Math.random() - 0.5) * H * 2.0;
      star.z = 1000;
      continue;
    }

    const k = 300 / star.z;
    const px = star.x * k + W / 2;
    const py = star.y * k + H / 2;
    const kOld = 300 / oldZ;
    const pxOld = star.x * kOld + W / 2;
    const pyOld = star.y * kOld + H / 2;

    if (px < -50 || px > W + 50 || py < -50 || py > H + 50) continue;

    const size = Math.max(0.1, (1 - star.z / 1000) * 2.4 * 0.9);
    const alpha = Math.max(0, Math.min(1, (1 - star.z / 1000) * 0.9));

    const speedRatio = Math.max(0, Math.min(1, (speedMul - 3) / 8));
    if (speedRatio > 0.1) {
      const len = Math.abs(px - pxOld) + Math.abs(py - pyOld);
      if (len > 1.5) {
        ctx.beginPath();
        ctx.moveTo(pxOld, pyOld);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `rgba(225, 235, 250, ${alpha * (0.6 + speedRatio * 0.4)})`;
        ctx.lineWidth = Math.max(0.4, size * (0.5 + speedRatio * 0.5));
        ctx.stroke();
        continue;
      }
    }

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(225, 235, 250, ${alpha})`;
    ctx.fill();
  }
}

/* ---------- НЕБО — плавное угасание 80-170 км ---------- */
function drawSky(km) {
  if (km > 170) return;

  const tSky = Math.min(1, Math.max(0, (km - 80) / 90));
  const alpha = 1 - tSky;
  if (alpha <= 0.005) return;

  skyPhase += 0.0028;
  const w = W, h = H;

  const breatheA = Math.sin(skyPhase) * 0.5 + 0.5;
  const breatheB = Math.sin(skyPhase * 0.73 + 1.7) * 0.5 + 0.5;

  const stop1 = 0.32 + breatheA * 0.06;
  const stop2 = 0.68 + breatheB * 0.06;

  const zenR = 6 + breatheA * 8;
  const zenG = 26 + breatheA * 12;
  const zenB = 70 + breatheA * 14;
  const midR = 40 + breatheB * 12;
  const midG = 96 + breatheB * 12;
  const midB = 176 + breatheB * 10;
  const horR = 150 + breatheA * 20;
  const horG = 195 + breatheA * 15;
  const horB = 235 + breatheA * 10;
  const lowR = 210 + breatheB * 15;
  const lowG = 230 + breatheB * 10;
  const lowB = 245 + breatheB * 5;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0.00, `rgba(${zenR|0}, ${zenG|0}, ${zenB|0}, ${alpha})`);
  grad.addColorStop(stop1, `rgba(${midR|0}, ${midG|0}, ${midB|0}, ${alpha})`);
  grad.addColorStop(stop2, `rgba(${horR|0}, ${horG|0}, ${horB|0}, ${alpha})`);
  grad.addColorStop(1.00, `rgba(${lowR|0}, ${lowG|0}, ${lowB|0}, ${alpha})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  if (km < 130) {
    const sunX = w * 0.82;
    const sunY = h * 0.18;
    const glows = [
      { x: sunX,            y: sunY,             r: h * 0.45, a: 0.55, phase: 0.0 },
      { x: sunX - w * 0.15, y: sunY + h * 0.22,  r: h * 0.55, a: 0.22, phase: 1.7 },
      { x: sunX + w * 0.06, y: sunY + h * 0.55,  r: h * 0.70, a: 0.12, phase: 3.1 }
    ];

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const g of glows) {
      const dx = Math.cos(skyPhase * 0.6 + g.phase) * w * 0.03;
      const dy = Math.sin(skyPhase * 0.5 + g.phase) * h * 0.02;
      const px = g.x + dx;
      const py = g.y + dy;
      const pulse = 0.85 + 0.15 * Math.sin(skyPhase * 1.3 + g.phase);
      const r = Math.max(1, g.r * pulse);
      const a = g.a * alpha * pulse;
      const rg = ctx.createRadialGradient(px, py, 0, px, py, r);
      rg.addColorStop(0,   `rgba(255, 248, 230, ${a})`);
      rg.addColorStop(0.4, `rgba(255, 235, 200, ${a * 0.35})`);
      rg.addColorStop(1,   `rgba(255, 220, 180, 0)`);
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/* ---------- ТУМАННОСТИ ---------- */
function buildNebulaCache() {
  const dpr = Math.max(1, window.devicePixelRatio);
  nebulaCache = document.createElement('canvas');
  nebulaCache.width = Math.round(W * dpr);
  nebulaCache.height = Math.round(H * dpr);
  const nctx = nebulaCache.getContext('2d');
  nctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  for (const n of nebulae) {
    const x = n.x * W, y = n.y * H;
    const r = n.r * Math.max(W, H);
    const g = nctx.createRadialGradient(x, y, 0, x, y, r);
    const [cr, cg, cb] = n.color;
    g.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${n.alpha})`);
    g.addColorStop(0.55, `rgba(${cr}, ${cg}, ${cb}, ${n.alpha * 0.35})`);
    g.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
    nctx.fillStyle = g;
    nctx.beginPath(); nctx.arc(x, y, r, 0, Math.PI * 2); nctx.fill();
  }
}

function drawNebulae() {
  if (!nebulaCache) buildNebulaCache();
  ctx.drawImage(nebulaCache, 0, 0, W, H);
}

/* ---------- СОЛНЦЕ ---------- */
function drawSun(km) {
  if (km > 6000000000) return;

  const auDist = km / 150000000;
  const auSafe = Math.max(1, auDist);

  const brightness = 1 / (auSafe * auSafe);
  const coreR = Math.max(1.0, 7 / auSafe);
  const haloR = Math.max(15, 100 / auSafe);
  const alpha = Math.min(1, brightness * 5);

  const cx = W - 50;
  const cy = 50;

  let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloR);
  g.addColorStop(0,   `rgba(255, 245, 220, ${alpha * 0.7})`);
  g.addColorStop(0.2, `rgba(255, 220, 150, ${alpha * 0.35})`);
  g.addColorStop(0.5, `rgba(255, 180, 90, ${alpha * 0.1})`);
  g.addColorStop(1,   'rgba(255, 180, 90, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
  ctx.fill();

  g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(2, coreR * 4));
  g.addColorStop(0,   `rgba(255, 255, 255, ${alpha})`);
  g.addColorStop(0.3, `rgba(255, 245, 200, ${alpha * 0.85})`);
  g.addColorStop(1,   `rgba(255, 220, 130, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(2, coreR * 4), 0, Math.PI * 2);
  ctx.fill();
}

/* ---------- ЗВЁЗДЫ ---------- */
const stars = [];
function initStars() {
  stars.length = 0;
  for (let li = 0; li < LAYERS.length; li++) {
    for (let i = 0; i < LAYERS[li].count; i++) {
      stars.push({
        x: (Math.random() - 0.5) * W * 2.0,
        y: (Math.random() - 0.5) * H * 2.0,
        z: Math.random() * 1000 + 1,
        layer: li
      });
    }
  }
}
initStars();

function drawStars(dt) {
  const km = getCurrentKm();
  if (km < 160) return;

  const starAlpha = Math.min(0.98, (km - 160) / 80);
  const dtNorm = (dt || 0.016) / 0.016;

  for (const star of stars) {
    const layer = LAYERS[star.layer];
    const effectiveSpeed = starsSpeed * layer.speedMul;
    const oldZ = star.z;
    star.z -= effectiveSpeed * dtNorm;
    if (star.z <= 0) {
      star.x = (Math.random() - 0.5) * W * 2.0;
      star.y = (Math.random() - 0.5) * H * 2.0;
      star.z = 1000;
      continue;
    }
    const k = 300 / star.z;
    const px = star.x * k + W / 2;
    const py = star.y * k + H / 2;
    const kOld = 300 / oldZ;
    const pxOld = star.x * kOld + W / 2;
    const pyOld = star.y * kOld + H / 2;
    if (px < -50 || px > W + 50 || py < -50 || py > H + 50) continue;

    const size = Math.max(0.1, (1 - star.z / 1000) * 2.4 * layer.sizeMul);
    const alpha = Math.max(0, Math.min(1, (1 - star.z / 1000) * starAlpha * layer.alphaMul));

    const speedRatio = Math.max(0, Math.min(1, (starsSpeed - 5) / 7));
    if (speedRatio > 0.15) {
      const len = Math.abs(px - pxOld) + Math.abs(py - pyOld);
      if (len > 2.5) {
        ctx.beginPath();
        ctx.moveTo(pxOld, pyOld);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `rgba(200, 220, 255, ${alpha * (0.6 + speedRatio * 0.4)})`;
        ctx.lineWidth = Math.max(0.4, size * (0.5 + speedRatio * 0.5));
        ctx.stroke();
        continue;
      }
    }
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
    ctx.fill();
  }
}

/* =========================================================
   ЖЁСТКИЙ РЕСАЙЗ — DPR + setTransform
   ========================================================= */
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.max(1, window.devicePixelRatio);

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  uiCanvas.width = Math.round(w * dpr);
  uiCanvas.height = Math.round(h * dpr);
  uiCanvas.style.width = w + 'px';
  uiCanvas.style.height = h + 'px';
  uiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  W = w;
  H = h;
  nebulaCache = null;

  if (typeof initClouds === 'function') initClouds();
  if (typeof initParticles === 'function') initParticles();
  initStars();
}

resize();
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);

window.addEventListener('load', () => {
  resize();
  setTimeout(resize, 50);
  setTimeout(resize, 150);
  setTimeout(resize, 500);
  setTimeout(resize, 1500);
});