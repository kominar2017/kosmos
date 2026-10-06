/* =========================================================
   MAIN — главный цикл анимации
   Оптимизация: рендерим только видимые объекты
   + сброс opacity для невидимых (фикс залипания планет)
   + ВРЕМЕННО: замеры производительности (performance.now)
   ========================================================= */

/* ---------- СЧЁТЧИКИ ДЛЯ УСРЕДНЕНИЯ (временные) ---------- */
let _perfFrameCount = 0;
let _perfSumBg = 0, _perfSumSky = 0, _perfSumClouds = 0, _perfSumNeb = 0;
let _perfSumStars = 0, _perfSumPart = 0, _perfSumSun = 0;
let _perfSumEarth = 0, _perfSumMoon = 0, _perfSumMars = 0;
let _perfSumJupiter = 0, _perfSumSaturn = 0, _perfSumUranus = 0;
let _perfSumNeptune = 0, _perfSumPluto = 0, _perfSumISS = 0;
let _perfSumVoyager = 0, _perfSumAster = 0, _perfSumKuiper = 0;
let _perfSumScale = 0, _perfSumTotal = 0;

function animate(now) {
  const _frameStart = performance.now();

  const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  globalTime += dt;

  if (typeof orbitMode !== 'undefined' && orbitMode) {
    ctx.clearRect(0, 0, W, H);
    updateOrbit();
    return requestAnimationFrame(animate);
  }

  if (reviewMode && reviewPlaying) {
    reviewSliderPos += PLAY_SPEED * dt;
    if (reviewSliderPos >= 1000) {
      reviewSliderPos = 1000;
      reviewPlaying = false;
      reviewPlay.textContent = '▶';
    }
    reviewSlider.value = reviewSliderPos;
    viewKm = reviewSliderToKm(reviewSliderPos);
    reviewKmLabel.textContent = formatKmNumber(viewKm);
    distanceEl.textContent = formatDistance(BigInt(Math.round(viewKm)));
  }

  const km = getCurrentKm();
  const kmNum = Number(km);

  clickEnergy -= CLICK_ENERGY_DECAY * dt;
  if (clickEnergy < 0) clickEnergy = 0;

  clickFlash -= dt * 5;
  if (clickFlash < 0) clickFlash = 0;

  inertiaSpeed -= INERTIA_DECAY * dt * inertiaSpeed;
  if (inertiaSpeed < 0.05) inertiaSpeed = 0.05;

  starsSpeed = MIN_STARS_SPEED +
               inertiaSpeed * (MAX_STARS_SPEED - MIN_STARS_SPEED) / MAX_STARS_SPEED;
  if (starsSpeed > MAX_STARS_SPEED) starsSpeed = MAX_STARS_SPEED;

  const boost = Math.min(1, clickEnergy + clickFlash * 0.4);
  counterEl.style.setProperty('--boost', boost.toFixed(3));

  /* ========== ЗАМЕР: ФОН ========== */
  const _t0 = performance.now();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  const _t1 = performance.now();

  drawSky(km);
  const _t2 = performance.now();

  drawSkyClouds(km, dt);
  const _t3 = performance.now();

  drawNebulae();
  const _t4 = performance.now();

  drawStars(dt);
  const _t5 = performance.now();

  drawParticles(dt);
  const _t6 = performance.now();

  drawSun(km);
  const _t7 = performance.now();

  /* ========== ЗАМЕР: 3D-ОБЪЕКТЫ ========== */

  const _tE0 = performance.now();
  if (kmNum >= 100 && kmNum <= 384400) updateEarth(km, dt);
  else earthCanvas.style.opacity = '0';
  const _tE1 = performance.now();

  if (kmNum >= 80000 && kmNum <= 550000) updateMoon(km, dt);
  else moonCanvas.style.opacity = '0';
  const _tM0 = performance.now();

  if (kmNum >= 224574000 && kmNum <= 225232000) updateMars(km, dt);
  else marsCanvas.style.opacity = '0';
  const _tMa = performance.now();

  if (kmNum >= 627220000 && kmNum <= 628780000) updateJupiter(km, dt);
  else jupiterCanvas.style.opacity = '0';
  const _tJ = performance.now();

  if (kmNum >= 1273640000 && kmNum <= 1276360000) updateSaturn(km, dt);
  else saturnCanvas.style.opacity = '0';
  const _tS = performance.now();

  if (kmNum >= 2722100000 && kmNum <= 2723900000) updateUranus(km, dt);
  else uranusCanvas.style.opacity = '0';
  const _tU = performance.now();

  if (kmNum >= 4350115000 && kmNum <= 4351885000) updateNeptune(km, dt);
  else neptuneCanvas.style.opacity = '0';
  const _tN = performance.now();

  if (kmNum >= 5905610000 && kmNum <= 5906390000) updatePluto(km, dt);
  else plutoCanvas.style.opacity = '0';
  const _tP = performance.now();

  if (kmNum >= 385 && kmNum <= 405) updateISS(km, dt);
  else issCanvas.style.opacity = '0';
  const _tI = performance.now();

  if (kmNum >= 20000000000 && kmNum <= 28000000000) updateVoyager(km, dt);
  else voyagerCanvas.style.opacity = '0';
  const _tV = performance.now();

  if (kmNum >= 300000000 && kmNum <= 500000000) updateAsteroids(km, dt);
  else asteroidsCanvas.style.opacity = '0';
  const _tA = performance.now();

  if (kmNum >= 4500000000 && kmNum <= 8000000000) updateKuiper(km, dt);
  else kuiperCanvas.style.opacity = '0';
  const _tK = performance.now();

  drawScale();
  const _tSc = performance.now();

  const _frameEnd = performance.now();

  /* ========== УСРЕДНЕНИЕ РАЗ В 60 КАДРОВ ========== */
  _perfSumBg      += (_t1 - _t0);
  _perfSumSky     += (_t2 - _t1);
  _perfSumClouds  += (_t3 - _t2);
  _perfSumNeb     += (_t4 - _t3);
  _perfSumStars   += (_t5 - _t4);
  _perfSumPart    += (_t6 - _t5);
  _perfSumSun     += (_t7 - _t6);

  _perfSumEarth   += (_tE1 - _tE0);
  _perfSumMoon    += (_tM0 - _tE1);
  _perfSumMars    += (_tMa - _tM0);
  _perfSumJupiter += (_tJ - _tMa);
  _perfSumSaturn  += (_tS - _tJ);
  _perfSumUranus  += (_tU - _tS);
  _perfSumNeptune += (_tN - _tU);
  _perfSumPluto   += (_tP - _tN);
  _perfSumISS     += (_tI - _tP);
  _perfSumVoyager += (_tV - _tI);
  _perfSumAster   += (_tA - _tV);
  _perfSumKuiper  += (_tK - _tA);

  _perfSumScale   += (_tSc - _tK);
  _perfSumTotal   += (_frameEnd - _frameStart);
  _perfFrameCount++;

  if (_perfFrameCount >= 60) {
    console.log(
      '=== AVG (60 frames) ===',
      '\n bg:',      (_perfSumBg      / 60).toFixed(2),
      '\n sky:',     (_perfSumSky     / 60).toFixed(2),
      '\n clouds:',  (_perfSumClouds  / 60).toFixed(2),
      '\n neb:',     (_perfSumNeb     / 60).toFixed(2),
      '\n stars:',   (_perfSumStars   / 60).toFixed(2),
      '\n particles:',(_perfSumPart   / 60).toFixed(2),
      '\n sun:',     (_perfSumSun     / 60).toFixed(2),
      '\n earth:',   (_perfSumEarth   / 60).toFixed(2),
      '\n moon:',    (_perfSumMoon    / 60).toFixed(2),
      '\n mars:',    (_perfSumMars    / 60).toFixed(2),
      '\n jupiter:', (_perfSumJupiter / 60).toFixed(2),
      '\n saturn:',  (_perfSumSaturn  / 60).toFixed(2),
      '\n uranus:',  (_perfSumUranus  / 60).toFixed(2),
      '\n neptune:', (_perfSumNeptune / 60).toFixed(2),
      '\n pluto:',   (_perfSumPluto   / 60).toFixed(2),
      '\n iss:',     (_perfSumISS     / 60).toFixed(2),
      '\n voyager:', (_perfSumVoyager / 60).toFixed(2),
      '\n asteroids:',(_perfSumAster  / 60).toFixed(2),
      '\n kuiper:',  (_perfSumKuiper  / 60).toFixed(2),
      '\n scale:',   (_perfSumScale   / 60).toFixed(2),
      '\n TOTAL:',   (_perfSumTotal   / 60).toFixed(2),
      'мс  → FPS ~', (1000 / (_perfSumTotal / 60)).toFixed(1)
    );

    _perfFrameCount = 0;
    _perfSumBg = _perfSumSky = _perfSumClouds = _perfSumNeb = 0;
    _perfSumStars = _perfSumPart = _perfSumSun = 0;
    _perfSumEarth = _perfSumMoon = _perfSumMars = 0;
    _perfSumJupiter = _perfSumSaturn = _perfSumUranus = 0;
    _perfSumNeptune = _perfSumPluto = _perfSumISS = 0;
    _perfSumVoyager = _perfSumAster = _perfSumKuiper = 0;
    _perfSumScale = _perfSumTotal = 0;
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame((t) => {
  lastFrameTime = t;
  animate(t);
});