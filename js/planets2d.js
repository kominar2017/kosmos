/* =========================================================
   PLANETS 2D — все планеты, карлики, зонды, звёзды, пояса
   ========================================================= */

/* ---------- БАЗОВАЯ СФЕРА ---------- */
function drawPlanetSphere(x, y, r, colors, atmosphereColor, atmosphereStrength) {
  if (atmosphereStrength > 0 && atmosphereColor) {
    const [ar, ag, ab] = atmosphereColor;
    const glow = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.4);
    glow.addColorStop(0, `rgba(${ar}, ${ag}, ${ab}, ${0.45 * atmosphereStrength})`);
    glow.addColorStop(0.5, `rgba(${ar}, ${ag}, ${ab}, ${0.2 * atmosphereStrength})`);
    glow.addColorStop(1, `rgba(${ar}, ${ag}, ${ab}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, r * 1.4, 0, Math.PI * 2); ctx.fill();
  }
  const lightX = x + r * 0.4;
  const lightY = y - r * 0.5;
  const baseGrad = ctx.createRadialGradient(lightX, lightY, r * 0.05, x, y, r * 1.05);
  for (let i = 0; i < colors.length; i++) {
    baseGrad.addColorStop(i / (colors.length - 1), colors[i]);
  }
  ctx.fillStyle = baseGrad;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  const dark = ctx.createRadialGradient(
    x - r * 0.6, y + r * 0.7, r * 0.1,
    x - r * 0.3, y + r * 0.4, r * 1.2
  );
  dark.addColorStop(0, 'rgba(0, 0, 0, 0)');
  dark.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
  dark.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  const highlight = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, r * 0.6);
  highlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlight;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

/* ---------- МАРС ---------- */
function drawMars(x, y, r, body) {
  drawPlanetSphere(x, y, r,
    ['#f4b088', '#e07040', '#c1440e', '#8a2e08', '#3a0d02'],
    [255, 140, 80], 0.25);
  if (r > 12) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    const rot = (body.rotationSpeed || 0.25) * globalTime;
    const poleGrad = ctx.createRadialGradient(x, y - r * 0.9, r * 0.05, x, y - r * 0.9, r * 0.5);
    poleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    poleGrad.addColorStop(0.6, 'rgba(255, 250, 245, 0.4)');
    poleGrad.addColorStop(1, 'rgba(255, 250, 245, 0)');
    ctx.fillStyle = poleGrad;
    ctx.beginPath(); ctx.ellipse(x, y - r * 0.85, r * 0.35, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    if (r > 25) {
      const darks = [
        { lon: 20, lat: 5, r: 0.35, a: 0.35 }, { lon: -40, lat: -10, r: 0.28, a: 0.3 },
        { lon: 70, lat: -25, r: 0.3, a: 0.28 }, { lon: -100, lat: 20, r: 0.25, a: 0.25 }
      ];
      for (const d of darks) {
        const p = projectSphere(d.lon + rot, d.lat, x, y, r);
        if (!p) continue;
        const dr = r * d.r * p.depth;
        if (dr < 2) continue;
        const dg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dr);
        dg.addColorStop(0, `rgba(70, 25, 8, ${d.a * p.depth})`);
        dg.addColorStop(0.7, `rgba(90, 35, 15, ${d.a * 0.5 * p.depth})`);
        dg.addColorStop(1, 'rgba(90, 35, 15, 0)');
        ctx.fillStyle = dg;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, dr, dr * 0.65, 0.3, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }
}

function drawVenus(x, y, r) {
  drawPlanetSphere(x, y, r,
    ['#f8ecc0', '#e8d090', '#c8a850', '#8a7030', '#3a2a10'],
    [255, 220, 140], 0.4);
}

function drawMercury(x, y, r) {
  drawPlanetSphere(x, y, r,
    ['#c8c0b0', '#a09888', '#706858', '#403830', '#181410'],
    [180, 170, 150], 0.08);
}

/* ---------- ЮПИТЕР ---------- */
function drawJupiter(x, y, r, body) {
  drawPlanetSphere(x, y, r,
    ['#f0d0a0', '#e0bc80', '#c8a068', '#907858', '#4a3520'],
    [255, 220, 160], 0.3);
  if (r > 12) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    const rot = (body.rotationSpeed || 0.4) * globalTime;
    const shift = ((rot % 1) * 2 - 1) * r * 0.1;
    const bands = [
      { y: -0.75, h: 0.08, c: 'rgba(200, 160, 120, 0.55)', amp: 0.02 },
      { y: -0.6,  h: 0.1,  c: 'rgba(245, 225, 190, 0.55)', amp: 0.03 },
      { y: -0.45, h: 0.08, c: 'rgba(180, 140, 100, 0.6)',  amp: 0.025 },
      { y: -0.32, h: 0.1,  c: 'rgba(250, 235, 205, 0.5)',  amp: 0.035 },
      { y: -0.18, h: 0.08, c: 'rgba(190, 145, 105, 0.6)',  amp: 0.03 },
      { y: -0.05, h: 0.12, c: 'rgba(240, 215, 175, 0.55)', amp: 0.04 },
      { y: 0.1,   h: 0.1,  c: 'rgba(180, 130, 90, 0.65)',  amp: 0.035 },
      { y: 0.25,  h: 0.1,  c: 'rgba(245, 225, 190, 0.5)',  amp: 0.03 },
      { y: 0.4,   h: 0.09, c: 'rgba(190, 150, 110, 0.6)',  amp: 0.025 },
      { y: 0.55,  h: 0.1,  c: 'rgba(240, 220, 180, 0.5)',  amp: 0.03 },
      { y: 0.7,   h: 0.08, c: 'rgba(200, 160, 120, 0.5)',  amp: 0.02 }
    ];
    for (let bi = 0; bi < bands.length; bi++) {
      const b = bands[bi];
      const baseY = y + b.y * r + shift;
      const bandH = b.h * r;
      ctx.beginPath();
      const steps = 30;
      ctx.moveTo(x - r, baseY);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = x - r + r * 2 * t;
        const w1 = Math.sin(t * 6 + bi * 1.7 + globalTime * 0.5) * b.amp * r;
        const w2 = Math.sin(t * 14 + bi * 2.3 + globalTime * 0.7) * b.amp * r * 0.4;
        ctx.lineTo(px, baseY + w1 + w2);
      }
      for (let i = steps; i >= 0; i--) {
        const t = i / steps;
        const px = x - r + r * 2 * t;
        const w1 = Math.sin(t * 6 + bi * 1.7 + globalTime * 0.5) * b.amp * r;
        const w2 = Math.sin(t * 14 + bi * 2.3 + globalTime * 0.7) * b.amp * r * 0.4;
        ctx.lineTo(px, baseY + bandH + w1 + w2);
      }
      ctx.closePath();
      ctx.fillStyle = b.c;
      ctx.fill();
    }
    if (r > 30) {
      const spotX = x + r * 0.3 + shift;
      const spotY = y + r * 0.18;
      const spotR = r * 0.2;
      const outerGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotR * 1.6);
      outerGrad.addColorStop(0, 'rgba(230, 120, 80, 0.5)');
      outerGrad.addColorStop(0.6, 'rgba(220, 100, 60, 0.25)');
      outerGrad.addColorStop(1, 'rgba(220, 100, 60, 0)');
      ctx.fillStyle = outerGrad;
      ctx.beginPath(); ctx.ellipse(spotX, spotY, spotR * 1.6, spotR * 0.85, 0, 0, Math.PI * 2); ctx.fill();
      const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotR);
      spotGrad.addColorStop(0, 'rgba(210, 90, 60, 0.9)');
      spotGrad.addColorStop(0.7, 'rgba(190, 70, 45, 0.75)');
      spotGrad.addColorStop(1, 'rgba(170, 60, 40, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath(); ctx.ellipse(spotX, spotY, spotR, spotR * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

/* ---------- САТУРН ---------- */
function drawSaturn(x, y, r, body) {
  if (r > 8) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(-0.3);
    ctx.strokeStyle = 'rgba(240, 220, 180, 0.75)';
    ctx.lineWidth = r * 0.15;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.85, r * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = r * 0.03;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 2.0, r * 0.46, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(220, 200, 165, 0.65)';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 2.13, r * 0.49, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  drawPlanetSphere(x, y, r,
    ['#f8ecc8', '#e8d8a0', '#d0b878', '#907850', '#3a2a18'],
    [255, 240, 200], 0.3);
  if (r > 12) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    const rot = (body.rotationSpeed || 0.35) * globalTime;
    const shift = ((rot % 1) * 2 - 1) * r * 0.08;
    const bands = [
      { y: -0.65, h: 0.1, c: 'rgba(240, 225, 185, 0.5)' },
      { y: -0.4, h: 0.12, c: 'rgba(225, 205, 165, 0.5)' },
      { y: -0.15, h: 0.15, c: 'rgba(245, 230, 190, 0.5)' },
      { y: 0.15, h: 0.14, c: 'rgba(230, 210, 170, 0.5)' },
      { y: 0.42, h: 0.12, c: 'rgba(245, 230, 190, 0.5)' }
    ];
    for (const b of bands) {
      ctx.fillStyle = b.c;
      ctx.fillRect(x - r, y + b.y * r + shift, r * 2, b.h * r);
    }
    ctx.restore();
  }
  if (r > 8) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(-0.3);
    ctx.strokeStyle = 'rgba(245, 225, 185, 0.9)';
    ctx.lineWidth = r * 0.15;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.85, r * 0.42, 0, Math.PI * 0.82, Math.PI * 1.18); ctx.stroke();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = r * 0.03;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 2.0, r * 0.46, 0, Math.PI * 0.82, Math.PI * 1.18); ctx.stroke();
    ctx.strokeStyle = 'rgba(230, 210, 170, 0.8)';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 2.13, r * 0.49, 0, Math.PI * 0.82, Math.PI * 1.18); ctx.stroke();
    ctx.restore();
  }
}

function drawUranus(x, y, r) {
  drawPlanetSphere(x, y, r,
    ['#e8f4f8', '#c8e8f4', '#a0d4e4', '#6090a0', '#203a48'],
    [160, 220, 240], 0.45);
}

function drawNeptune(x, y, r, body) {
  drawPlanetSphere(x, y, r,
    ['#a8c0e8', '#6080d0', '#3a5fbf', '#18307a', '#08183a'],
    [80, 120, 220], 0.45);
  if (r > 20) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    const rot = (body.rotationSpeed || 0.3) * globalTime;
    const shift = ((rot % 1) * 2 - 1) * r * 0.3;
    const sg = ctx.createRadialGradient(x - r * 0.2 + shift, y - r * 0.1, 0, x - r * 0.2 + shift, y - r * 0.1, r * 0.25);
    sg.addColorStop(0, 'rgba(20, 40, 90, 0.7)');
    sg.addColorStop(1, 'rgba(20, 40, 90, 0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.ellipse(x - r * 0.2 + shift, y - r * 0.1, r * 0.25, r * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function drawPluto(x, y, r) {
  drawPlanetSphere(x, y, r,
    ['#f0e0c8', '#d8c0a0', '#a89070', '#604830', '#281810'],
    [200, 180, 160], 0.08);
}

function drawDwarf(x, y, r) {
  drawPlanetSphere(x, y, r,
    ['#e8dce8', '#c0b0c8', '#9088a0', '#504860', '#201828'],
    [180, 160, 200], 0.08);
}

function drawGalilean(x, y, r) {
  drawPlanetSphere(x, y, r,
    ['#f0e8d8', '#d0c0a0', '#a09070', '#605040', '#282018'],
    [200, 180, 140], 0.08);
}

function drawTitan(x, y, r) {
  drawPlanetSphere(x, y, r,
    ['#f8d090', '#e0a860', '#b07840', '#604020', '#201008'],
    [255, 180, 80], 0.4);
}

function drawProbe(x, y, r) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r*2.5);
  g.addColorStop(0, 'rgba(200,220,255,0.95)'); g.addColorStop(1, 'rgba(200,220,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r*2.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, Math.max(1, r*0.3), 0, Math.PI*2); ctx.fill();
}

function drawStarBody(x, y, r) {
  let g = ctx.createRadialGradient(x, y, 0, x, y, r*4);
  g.addColorStop(0, '#fff8e0'); g.addColorStop(0.15, 'rgba(255,240,200,0.7)');
  g.addColorStop(0.4, 'rgba(255,220,160,0.25)'); g.addColorStop(1, 'rgba(255,220,160,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r*4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r*0.4, 0, Math.PI*2); ctx.fill();
}

function drawSupergiant(x, y, r) {
  let g = ctx.createRadialGradient(x, y, 0, x, y, r*5);
  g.addColorStop(0, '#ffd0a8'); g.addColorStop(0.15, 'rgba(255,160,100,0.8)');
  g.addColorStop(0.4, 'rgba(255,120,70,0.3)'); g.addColorStop(1, 'rgba(255,80,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r*5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,220,0.95)'; ctx.beginPath(); ctx.arc(x, y, r*0.6, 0, Math.PI*2); ctx.fill();
}

/* ---------- ПОЯСА АСТЕРОИДОВ ---------- */
function drawBelt(belt, km) {
  for (const ast of belt) {
    const objKm = ast.distance;
    const ratio = km / objKm;
    if (ratio < 0.3 || ratio > 1.9) continue;
    const delta = km - objKm;
    const absDelta = Math.abs(delta);
    const visibility = objKm * 0.85;
    if (absDelta > visibility) continue;
    const proximity = 1 - absDelta / visibility;
    const xOff = ast.xOff * W * 0.55 * (1 - proximity * 0.5);
    const x = W / 2 + xOff;
    const yOff = ast.yOff * H * 0.55 * (1 - proximity * 0.5);
    const y = H / 2 + yOff + (delta / visibility) * H * 0.4;
    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
    const size = ast.size * (1 + proximity * 2.5) * 0.8;
    const alpha = ast.alpha * (0.3 + proximity * 0.7);
    const rotation = ast.rot + globalTime * ast.rotSpeed;
    ctx.beginPath();
    const n = ast.verts.length;
    for (let i = 0; i < n; i++) {
      const angle = ast.verts[i] + rotation;
      const rad = size * (0.8 + Math.sin(i * 1.7 + ast.rot) * 0.2);
      const px = x + Math.cos(angle) * rad;
      const py = y + Math.sin(angle) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const grad = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
    grad.addColorStop(0, `rgba(180, 170, 150, ${alpha})`);
    grad.addColorStop(0.6, `rgba(120, 110, 95, ${alpha * 0.9})`);
    grad.addColorStop(1, `rgba(60, 55, 50, ${alpha * 0.8})`);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

/* ---------- ОБЩИЙ drawBody ---------- */
function drawBody(body, km) {
  const objKm = Number(body.distance);
  const ratio = km / objKm;
  if (ratio < 0.1 || ratio > 1.9) return;
  const delta = km - objKm;
  const absDelta = Math.abs(delta);
  const visibility = objKm * 0.9;
  if (absDelta > visibility) return;
  const proximity = 1 - absDelta / visibility;

  const baseSize = Math.min(W, H) * body.size;
  const size = baseSize * (0.1 + proximity * 0.9);
  const r = size * 0.5;

  const x = W / 2;
  const t = delta / visibility;
  const y = H / 2 + t * H * 0.5;

  if (y + r * 1.5 < -200 || y - r * 1.5 > H + 200) return;
  if (size < 3) return;

  const edgeFade = 1 - Math.pow(Math.abs(t), 4);
  const opacity = Math.min(1, (size - 3) / 12) * edgeFade;
  if (opacity <= 0.01) return;
  ctx.globalAlpha = opacity;

  if (body.type === 'mars')        drawMars(x, y, r, body);
  else if (body.type === 'venus')  drawVenus(x, y, r);
  else if (body.type === 'mercury')drawMercury(x, y, r);
  else if (body.type === 'jupiter')drawJupiter(x, y, r, body);
  else if (body.type === 'saturn') drawSaturn(x, y, r, body);
  else if (body.type === 'uranus') drawUranus(x, y, r);
  else if (body.type === 'neptune')drawNeptune(x, y, r, body);
  else if (body.type === 'pluto')  drawPluto(x, y, r);
  else if (body.type === 'dwarf')  drawDwarf(x, y, r);
  else if (body.type === 'galilean')drawGalilean(x, y, r);
  else if (body.type === 'titan')  drawTitan(x, y, r);
  else if (body.type === 'probe')  drawProbe(x, y, r);
  else if (body.type === 'star')   drawStarBody(x, y, r);
  else if (body.type === 'supergiant')drawSupergiant(x, y, r);

  ctx.globalAlpha = 1;
}

/* ---------- ЗЕМЛЯ-ТОЧКА (после 60 000 км) ---------- */
function drawEarthDot(km) {
  if (km < 60000) return;
  if (km > 100000000) return;

  let fade = 1;
  if (km > 10000000) {
    fade = Math.max(0, 1 - (km - 10000000) / 90000000);
  }
  if (fade <= 0.01) return;

  const x = W / 2;
  const y = H * 0.75;

  const r = Math.max(1.5, (6371 / km) * (H * 1.15));
  const haloR = r * 5;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, haloR);
  haloGrad.addColorStop(0, `rgba(180, 220, 255, ${0.75 * fade})`);
  haloGrad.addColorStop(0.3, `rgba(140, 190, 240, ${0.35 * fade})`);
  haloGrad.addColorStop(1, `rgba(100, 150, 220, 0)`);
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(x, y, haloR, 0, Math.PI * 2);
  ctx.fill();

  const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
  coreGrad.addColorStop(0, `rgba(255, 255, 255, ${fade})`);
  coreGrad.addColorStop(0.6, `rgba(200, 230, 255, ${0.9 * fade})`);
  coreGrad.addColorStop(1, `rgba(140, 190, 240, ${0.2 * fade})`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ---------- ПОЯСА (данные) ---------- */
const asteroidBelt = [];
for (let i = 0; i < 50; i++) {
  const verts = 6 + Math.floor(Math.random() * 4);
  const angles = [];
  for (let v = 0; v < verts; v++) angles.push((v / verts) * Math.PI * 2 + (Math.random() - 0.5) * 0.4);
  asteroidBelt.push({
    distance: 300000000 + Math.random() * 180000000,
    xOff: (Math.random() - 0.5) * 0.9,
    yOff: (Math.random() - 0.5) * 0.7,
    size: 0.5 + Math.random() * 1.8,
    alpha: 0.3 + Math.random() * 0.5,
    verts: angles, rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.5
  });
}

const kuiperBelt = [];
for (let i = 0; i < 40; i++) {
  const verts = 5 + Math.floor(Math.random() * 4);
  const angles = [];
  for (let v = 0; v < verts; v++) angles.push((v / verts) * Math.PI * 2 + (Math.random() - 0.5) * 0.5);
  kuiperBelt.push({
    distance: 4500000000 + Math.random() * 3000000000,
    xOff: (Math.random() - 0.5) * 0.9,
    yOff: (Math.random() - 0.5) * 0.7,
    size: 0.5 + Math.random() * 1.4,
    alpha: 0.25 + Math.random() * 0.4,
    verts: angles, rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.4
  });
}