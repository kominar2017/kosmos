/* =========================================================
   REVIEW — режим просмотра полёта
   ========================================================= */

const reviewBtn = document.getElementById('reviewBtn');
const reviewPanel = document.getElementById('reviewPanel');
const reviewPlay = document.getElementById('reviewPlay');
const reviewSlider = document.getElementById('reviewSlider');
const reviewClose = document.getElementById('reviewClose');
const reviewKmLabel = document.getElementById('reviewKmLabel');

function enterReview() {
  reviewMode = true;
  reviewPlaying = false;
  reviewMaxKm = Math.max(Number(distance), 10000);
  reviewSliderPos = 0;
  viewKm = 1;
  reviewSlider.value = 0;
  reviewPlay.textContent = '▶';
  reviewKmLabel.textContent = formatKmNumber(1);
  reviewPanel.classList.add('show');
  reviewBtn.style.display = 'none';
  distanceEl.textContent = formatDistance(BigInt(1));
}

function exitReview() {
  reviewMode = false;
  reviewPlaying = false;
  reviewPanel.classList.remove('show');
  reviewBtn.style.display = 'block';
  distanceEl.textContent = formatDistance(distance);
}

reviewBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  enterReview();
});

reviewClose.addEventListener('click', (e) => {
  e.stopPropagation();
  exitReview();
});

reviewPlay.addEventListener('click', (e) => {
  e.stopPropagation();
  reviewPlaying = !reviewPlaying;
  reviewPlay.textContent = reviewPlaying ? '⏸' : '▶';
  if (reviewPlaying && reviewSliderPos >= 1000) {
    reviewSliderPos = 0;
    reviewSlider.value = 0;
    viewKm = 1;
  }
});

reviewSlider.addEventListener('input', (e) => {
  e.stopPropagation();
  reviewPlaying = false;
  reviewPlay.textContent = '▶';
  reviewSliderPos = parseFloat(e.target.value);
  viewKm = reviewSliderToKm(reviewSliderPos);
  reviewKmLabel.textContent = formatKmNumber(viewKm);
  distanceEl.textContent = formatDistance(BigInt(Math.round(viewKm)));
});

reviewSlider.addEventListener('click', (e) => e.stopPropagation());