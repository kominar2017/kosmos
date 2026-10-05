/* =========================================================
   JUMP — поле ввода км для быстрого перехода
   ========================================================= */

const jumpInput = document.getElementById('jumpInput');
const jumpBtn = document.getElementById('jumpBtn');

function jumpToKm(str) {
  const clean = String(str).trim().replace(/[\s,]/g, '').replace(',', '.');
  const km = Number(clean);
  if (!isFinite(km) || km < 0) return;

  distance = BigInt(Math.round(km));
  distanceEl.textContent = formatDistance(distance);

  while (nextMilestone < MILESTONES.length && distance >= MILESTONES[nextMilestone].d) {
    nextMilestone++;
  }

  save();
}

jumpInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    jumpToKm(jumpInput.value);
    jumpInput.blur();
  }
});

jumpBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  jumpToKm(jumpInput.value);
});

jumpInput.addEventListener('click', (e) => e.stopPropagation());