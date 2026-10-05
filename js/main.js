/* =========================================================
   MAIN — главный цикл анимации
   Передаём dt в drawStars и drawParticles для FPS-независимости.
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

  updateEarth(km, dt);
  updateMoon(km, dt);
  updateMars(km, dt);
  updateJupiter(km, dt);
  updateSaturn(km, dt);
  updateUranus(km, dt);
  updateNeptune(km, dt);
  updatePluto(km, dt);
  updateISS(km, dt);
  updateVoyager(km, dt);
  updateAsteroids(km, dt);
  updateKuiper(km, dt);

  drawScale();

  requestAnimationFrame(animate);
}

requestAnimationFrame((t) => {
  lastFrameTime = t;
  animate(t);
});