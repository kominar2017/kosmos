/* =========================================================
   UI — счётчик, шкала, milestone, клик, donate
   ========================================================= */

function drawScale() {
  uiCtx.clearRect(0, 0, W, H);
  if (reviewMode) return;
  if (typeof orbitMode !== 'undefined' && orbitMode) return;

  const km = Number(distance);
  const barY = H - 46;
  const x1 = W * 0.06;
  const x2 = W * 0.94;
  const barW = x2 - x1;

  uiCtx.save();
  const bgGrad = uiCtx.createLinearGradient(0, barY - 30, 0, barY + 30);
  bgGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bgGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.55)');
  bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  uiCtx.fillStyle = bgGrad;
  uiCtx.fillRect(0, barY - 30, W, 60);
  uiCtx.restore();

  uiCtx.strokeStyle = 'rgba(160, 200, 255, 0.35)';
  uiCtx.lineWidth = 1;
  uiCtx.beginPath(); uiCtx.moveTo(x1, barY); uiCtx.lineTo(x2, barY); uiCtx.stroke();

  const progressX = kmToScaleX(Math.max(km, 1), x1, barW);
  const grad = uiCtx.createLinearGradient(x1, barY, progressX, barY);
  grad.addColorStop(0, 'rgba(160, 200, 255, 0.55)');
  grad.addColorStop(1, 'rgba(190, 230, 255, 1)');
  uiCtx.strokeStyle = grad;
  uiCtx.lineWidth = 2;
  uiCtx.beginPath(); uiCtx.moveTo(x1, barY); uiCtx.lineTo(progressX, barY); uiCtx.stroke();

  uiCtx.textAlign = 'center';
  uiCtx.font = '400 10px "Space Mono", monospace';
  for (const m of SCALE_MARKS) {
    const x = kmToScaleX(m.km, x1, barW);
    const passed = km >= m.km;
    uiCtx.fillStyle = passed ? 'rgba(200, 235, 255, 1)' : 'rgba(160, 200, 255, 0.6)';
    uiCtx.beginPath();
    uiCtx.arc(x, barY, passed ? 3 : 2.5, 0, Math.PI * 2);
    uiCtx.fill();

    const yOff = m.level * 11;
    uiCtx.strokeStyle = passed ? 'rgba(200, 235, 255, 0.7)' : 'rgba(160, 200, 255, 0.3)';
    uiCtx.lineWidth = 1;
    uiCtx.beginPath(); uiCtx.moveTo(x, barY); uiCtx.lineTo(x, barY + yOff + 3); uiCtx.stroke();

    uiCtx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    uiCtx.shadowBlur = 4;
    uiCtx.fillStyle = passed ? 'rgba(220, 240, 255, 1)' : 'rgba(180, 210, 245, 0.55)';
    uiCtx.fillText(t(m.key), x, barY + yOff + 16);
    uiCtx.shadowBlur = 0;
  }

  uiCtx.shadowColor = 'rgba(160, 220, 255, 1)';
  uiCtx.shadowBlur = 16;
  uiCtx.fillStyle = '#f0f8ff';
  uiCtx.beginPath();
  uiCtx.arc(progressX, barY, 3.5, 0, Math.PI * 2);
  uiCtx.fill();
  uiCtx.shadowBlur = 0;
}

function checkMilestones() {
  if (nextMilestone >= MILESTONES.length) return;
  const m = MILESTONES[nextMilestone];
  if (distance >= m.d) {
    showMilestone(t(m.key));
    nextMilestone++;
    checkMilestones();
  }
}

let milestoneTimer = null;
function showMilestone(text) {
  milestoneEl.textContent = text;
  milestoneEl.classList.add('show');
  clearTimeout(milestoneTimer);
  milestoneTimer = setTimeout(() => milestoneEl.classList.remove('show'), 5000);
}

function save() {
  try {
    localStorage.setItem('space_distance', distance.toString());
    localStorage.setItem('space_milestone', nextMilestone.toString());
  } catch (e) {}
}

function load() {
  try {
    const d = localStorage.getItem('space_distance');
    const m = localStorage.getItem('space_milestone');
    if (d) distance = BigInt(d);
    if (m) nextMilestone = parseInt(m, 10);
    distanceEl.textContent = formatDistance(distance);
  } catch (e) {}
}
load();

let clickFlash = 0;

function handleClick(e) {
  if (e && e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON')) return;
  if (reviewMode) return;
  if (typeof orbitMode !== 'undefined' && orbitMode) return;

  distance += 1n;

  const now = performance.now();
  const dtClick = (now - lastClickTime) / 1000;

  let energyMul = 1.0;
  if (dtClick < 0.08)      energyMul = 3.5;
  else if (dtClick < 0.15) energyMul = 2.5;
  else if (dtClick < 0.3)  energyMul = 1.7;
  else if (dtClick < 0.6)  energyMul = 1.2;

  clickEnergy = Math.min(1, clickEnergy + CLICK_ENERGY_PER_CLICK * energyMul);

  let impulseMul = 1.0;
  if (dtClick < 0.08)      impulseMul = 2.0;
  else if (dtClick < 0.15) impulseMul = 1.6;
  else if (dtClick < 0.3)  impulseMul = 1.3;

  inertiaSpeed = Math.min(MAX_STARS_SPEED, inertiaSpeed + 1.5 * impulseMul);

  clickFlash = 1.0;
  lastClickTime = now;

  hintEl.style.opacity = '0';

  distanceEl.textContent = formatDistance(distance);
  checkMilestones();
  save();
}
document.body.addEventListener('click', handleClick);

document.getElementById('donate').addEventListener('click', (e) => {
  e.stopPropagation();
  alert(t('donateThanks'));
});