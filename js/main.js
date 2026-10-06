/* =========================================================
   MAIN — главный цикл анимации
   Оптимизация: рендерим только видимые объекты
   ========================================================= */

function animate(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  globalTime += dt;

  if (typeof orbitMode !== 'undefined' && orbitMode) {
    ctx.clearRect(0, 0, W, H);
    updateOrbit();
    return requestAnimationFrame(animate);
  }

  const km = getCurrentKm();
  const kmNum = Number(km);

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

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  drawSky(km);
  drawSkyClouds(km, dt);
  drawNebulae();
  drawStars(dt);
  drawParticles(dt);
  drawSun(km);

  /* === 3D-ОБЪЕКТЫ — ТОЛЬКО ВИДИМЫЕ === */

  if (kmNum >= 100 && kmNum <= 384400) {
    updateEarth(km, dt);
  }

  if (kmNum >= 80000 && kmNum <= 550000) {
    updateMoon(km, dt);
  }

  if (kmNum >= 224574000 && kmNum <= 225232000) {
    updateMars(km, dt);
  }

  if (kmNum >= 627220000 && kmNum <= 628780000) {
    updateJupiter(km, dt);
  }

  if (kmNum >= 1273640000 && kmNum <= 1276360000) {
    updateSaturn(km, dt);
  }

  if (kmNum >= 2722100000 && kmNum <= 2723900000) {
    updateUranus(km, dt);
  }

  if (kmNum >= 4350115000 && kmNum <= 4351885000) {
    updateNeptune(km, dt);
  }

  if (kmNum >= 5905610000 && kmNum <= 5906390000) {
    updatePluto(km, dt);
  }

  if (kmNum >= 385 && kmNum <= 405) {
    updateISS(km, dt);
  }

  if (kmNum >= 20000000000 && kmNum <= 28000000000) {
    updateVoyager(km, dt);
  }

  if (kmNum >= 300000000 && kmNum <= 500000000) {
    updateAsteroids(km, dt);
  }

  if (kmNum >= 4500000000 && kmNum <= 8000000000) {
    updateKuiper(km, dt);
  }

  drawScale();

  requestAnimationFrame(animate);
}

requestAnimationFrame((t) => {
  lastFrameTime = t;
  animate(t);
});