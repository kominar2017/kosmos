/* =========================================================
   CORE — состояние, константы, утилиты
   ========================================================= */

/* ---------- Загрузчик текстур ---------- */
const texLoader = new THREE.TextureLoader();

/* ---------- Состояние ---------- */
let distance = 0n;
let nextMilestone = 0;
let starsSpeed = 0;
let lastClickTime = 0;
let lastFrameTime = performance.now();
let globalTime = 0;
let skyPhase = 0;

let reviewMode = false;
let reviewPlaying = false;
let reviewSliderPos = 0;
let reviewMaxKm = 0;
let viewKm = 1;

const PLAY_SPEED = 5;

/* ---------- Датчик кликов ---------- */
let clickEnergy = 0;
const CLICK_ENERGY_PER_CLICK = 0.2;
const CLICK_ENERGY_DECAY = 0.3;
const CLICK_ENERGY_THRESHOLD = 0.6;

/* ---------- Инерция звёзд ---------- */
let inertiaSpeed = 0;
const INERTIA_DECAY = 0.9;
const MAX_STARS_SPEED = 14;
const MIN_STARS_SPEED = 0.3;

/* ---------- Канвасы ---------- */
const canvas = document.getElementById('space');
const ctx = canvas.getContext('2d', { alpha: false });
const uiCanvas = document.getElementById('ui-canvas');
const uiCtx = uiCanvas.getContext('2d');

let W, H;
let nebulaCache = null;
let skyClouds = [];
let particles = [];

/* ---------- Milestones ---------- */
const MILESTONES = [
  { d: 10n,                     key: 'ms_10' },
  { d: 100n,                    key: 'ms_100' },
  { d: 400n,                    key: 'ms_400' },
  { d: 384400n,                 key: 'ms_moon' },
  { d: 1500000n,                key: 'ms_lagrange' },
  { d: 41000000n,               key: 'ms_venus' },
  { d: 77000000n,               key: 'ms_mercury' },
  { d: 225000000n,              key: 'ms_mars' },
  { d: 400000000n,              key: 'ms_belt' },
  { d: 628000000n,              key: 'ms_jupiter' },
  { d: 1275000000n,             key: 'ms_saturn' },
  { d: 2723000000n,             key: 'ms_uranus' },
  { d: 4351000000n,             key: 'ms_neptune' },
  { d: 5000000000n,             key: 'ms_kuiper' },
  { d: 5906000000n,             key: 'ms_pluto' },
  { d: 24000000000n,            key: 'ms_voyager' },
  { d: 40000000000000n,         key: 'ms_alpha' },
  { d: 81000000000000n,         key: 'ms_sirius' },
  { d: 6400000000000000n,       key: 'ms_betel' },
  { d: 950000000000000000n,     key: 'ms_milky' },
  { d: 440000000000000000000000n, key: 'ms_edge' }
];

/* ---------- BODIES ---------- */
const BODIES = [
  { distance: 41000000n,    type: 'venus',      size: 0.5,  rotationSpeed: 0.2 },
  { distance: 77000000n,    type: 'mercury',    size: 0.35, rotationSpeed: 0.3 },
  { distance: 225000000n,   type: 'mars',       size: 0.65, rotationSpeed: 0.25 },
  { distance: 628000000n,   type: 'jupiter',    size: 0.85, rotationSpeed: 0.4 },
  { distance: 628000000n,   type: 'galilean',   size: 0.08 },
  { distance: 628000000n,   type: 'galilean',   size: 0.09 },
  { distance: 628000000n,   type: 'galilean',   size: 0.1 },
  { distance: 628000000n,   type: 'galilean',   size: 0.09 },
  { distance: 1275000000n,  type: 'saturn',     size: 0.8,  rotationSpeed: 0.35 },
  { distance: 1275000000n,  type: 'titan',      size: 0.1 },
  { distance: 2723000000n,  type: 'uranus',     size: 0.55, rotationSpeed: 0.3 },
  { distance: 4351000000n,  type: 'neptune',    size: 0.55, rotationSpeed: 0.3 },
  { distance: 5906000000n,  type: 'pluto',      size: 0.28, rotationSpeed: 0.2 },
  { distance: 6400000000n,  type: 'dwarf',      size: 0.22 },
  { distance: 6600000000n,  type: 'dwarf',      size: 0.22 },
  { distance: 7200000000n,  type: 'dwarf',      size: 0.24 },
  { distance: 24000000000n, type: 'probe',      size: 0.16 },
  { distance: 17000000000n, type: 'probe',      size: 0.16 },
  { distance: 8000000000n,  type: 'probe',      size: 0.14 },
  { distance: 40000000000000n, type: 'star',    size: 0.9 },
  { distance: 81000000000000n, type: 'star',    size: 0.85 },
  { distance: 6400000000000000n, type: 'supergiant', size: 1.1 }
];

/* ---------- Слои звёзд ---------- */
const LAYERS = [
  { speedMul: 0.35, sizeMul: 0.6, alphaMul: 0.55, count: 200 },
  { speedMul: 1.0,  sizeMul: 1.0, alphaMul: 0.85, count: 140 },
  { speedMul: 2.2,  sizeMul: 1.7, alphaMul: 1.0,  count: 60  }
];

/* ---------- Метки шкалы ---------- */
const SCALE_MARKS = [
  { km: 1,                  key: 'scale_earth',   level: 0 },
  { km: 400,                key: 'scale_iss',     level: 1 },
  { km: 384400,             key: 'scale_moon',    level: 0 },
  { km: 225000000,          key: 'scale_mars',    level: 1 },
  { km: 400000000,          key: 'scale_belt',    level: 0 },
  { km: 628000000,          key: 'scale_jupiter', level: 1 },
  { km: 1275000000,         key: 'scale_saturn',  level: 0 },
  { km: 2723000000,         key: 'scale_uranus',  level: 1 },
  { km: 4351000000,         key: 'scale_neptune', level: 0 },
  { km: 5906000000,         key: 'scale_pluto',   level: 1 },
  { km: 24000000000,        key: 'scale_voyager', level: 0 },
  { km: 40000000000000,     key: 'scale_alpha',   level: 1 }
];
const LOG_MAX = 14;

/* ---------- Туманности ---------- */
const nebulae = [
  { x: 0.22, y: 0.28, r: 0.65, color: [80, 40, 140],  alpha: 0.11 },
  { x: 0.78, y: 0.35, r: 0.55, color: [40, 80, 160],  alpha: 0.09 },
  { x: 0.50, y: 0.72, r: 0.75, color: [140, 60, 100], alpha: 0.07 },
  { x: 0.12, y: 0.78, r: 0.55, color: [40, 100, 140], alpha: 0.08 },
  { x: 0.88, y: 0.82, r: 0.45, color: [100, 60, 140], alpha: 0.06 }
];

/* ---------- Кратеры Луны (fallback) ---------- */
const MOON_CRATERS = [
  { lon: -20, lat: 10, r: 0.12 }, { lon: 15, lat: -8, r: 0.14 },
  { lon: 40, lat: 25, r: 0.09 },  { lon: -50, lat: -25, r: 0.11 },
  { lon: 80, lat: -15, r: 0.08 }, { lon: -80, lat: 30, r: 0.07 },
  { lon: 0, lat: -40, r: 0.1 },   { lon: 60, lat: 5, r: 0.06 },
  { lon: -35, lat: 45, r: 0.05 }, { lon: 100, lat: 20, r: 0.07 },
  { lon: -100, lat: -10, r: 0.08 }, { lon: 30, lat: -30, r: 0.06 }
];

/* ---------- DOM ---------- */
const distanceEl = document.getElementById('distance');
const counterEl = document.getElementById('counter');
const milestoneEl = document.getElementById('milestone');
const hintEl = document.getElementById('hint');

/* ---------- Утилиты ---------- */
function formatDistance(n) {
  if (n < 0n) n = 0n;
  const s = n.toString();
  if (s.length <= 15) {
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, currentLang === 'en' ? ',' : ' ');
  }
  const exp = s.length - 1;
  return s[0] + '.' + s.substring(1, 3) + ' × 10^' + exp;
}

function formatKmNumber(km) {
  if (km < 1) return '1 ' + t('unit').split(' ')[0].toLowerCase();
  if (km < 1000000) return Math.round(km).toLocaleString(currentLocale()) + ' ' + t('unit').split(' ')[0].toLowerCase();
  const exp = Math.floor(Math.log10(km));
  const mantissa = km / Math.pow(10, exp);
  return mantissa.toFixed(2) + ' × 10^' + exp + ' ' + t('unit').split(' ')[0].toLowerCase();
}

function getCurrentKm() {
  return reviewMode ? viewKm : Number(distance);
}

function kmToScaleX(kmVal, x1, barW) {
  if (kmVal < 1) kmVal = 1;
  const log = Math.log10(kmVal);
  const ratio = Math.min(1, Math.max(0, log / LOG_MAX));
  return x1 + ratio * barW;
}

function projectSphere(lonDeg, latDeg, cx, cy, r) {
  const lon = lonDeg * Math.PI / 180;
  const lat = latDeg * Math.PI / 180;
  const cosLat = Math.cos(lat);
  const sinLat = Math.sin(lat);
  const cosLon = Math.cos(lon);
  const sinLon = Math.sin(lon);
  if (cosLon <= 0.05) return null;
  return { x: cx + r * sinLon * cosLat, y: cy - r * sinLat, depth: cosLon };
}

/* =========================================================
   REVIEW TIMELINE — с Вояджером
   ========================================================= */
const REVIEW_TIMELINE = [
  { km: 0,          key: 'rv_start' },
  { km: 180,        key: 'rv_atmo' },
  { km: 1000,       key: 'rv_orbit' },
  { km: 5000,       key: 'rv_earthNear' },
  { km: 15000,      key: 'rv_earthNear' },
  { km: 30000,      key: 'rv_earthNear' },
  { km: 60000,      key: 'rv_earthNear' },
  { km: 100000,     key: 'rv_earthLeaves' },
  { km: 130000,     key: 'rv_earthLeaves' },
  { km: 180000,     key: 'rv_moonFar' },
  { km: 260000,     key: 'rv_moonFar' },
  { km: 330000,     key: 'rv_moonFar' },
  { km: 384400,     key: 'rv_moonPeak' },
  { km: 430000,     key: 'rv_moonGone' },
  { km: 480000,     key: 'rv_moonGone' },
  { km: 550000,     key: 'rv_moonGone' },
  { km: 2000000,    key: 'rv_interplanet' },
  { km: 100000000,  key: 'rv_interplanet' },
  { km: 224574000,  key: 'rv_marsPeak' },
  { km: 224700000,  key: 'rv_marsPeak' },
  { km: 224850000,  key: 'rv_marsPeak' },
  { km: 225000000,  key: 'rv_marsPeak' },
  { km: 225080000,  key: 'rv_marsPeak' },
  { km: 225180000,  key: 'rv_marsPeak' },
  { km: 225232000,  key: 'rv_marsPeak' },
  { km: 300000000,  key: 'rv_belt' },
  { km: 350000000,  key: 'rv_belt' },
  { km: 400000000,  key: 'rv_belt' },
  { km: 450000000,  key: 'rv_belt' },
  { km: 500000000,  key: 'rv_belt' },
  { km: 560000000,  key: 'rv_belt' },
  { km: 627220000,  key: 'rv_jupiterPeak' },
  { km: 627500000,  key: 'rv_jupiterPeak' },
  { km: 627800000,  key: 'rv_jupiterPeak' },
  { km: 628000000,  key: 'rv_jupiterPeak' },
  { km: 628300000,  key: 'rv_jupiterPeak' },
  { km: 628600000,  key: 'rv_jupiterPeak' },
  { km: 628780000,  key: 'rv_jupiterPeak' },
  { km: 1273640000, key: 'rv_saturnPeak' },
  { km: 1274000000, key: 'rv_saturnPeak' },
  { km: 1274600000, key: 'rv_saturnPeak' },
  { km: 1275000000, key: 'rv_saturnPeak' },
  { km: 1275400000, key: 'rv_saturnPeak' },
  { km: 1275900000, key: 'rv_saturnPeak' },
  { km: 1276360000, key: 'rv_saturnPeak' },
  { km: 2722100000, key: 'rv_uranusPeak' },
  { km: 2722400000, key: 'rv_uranusPeak' },
  { km: 2722700000, key: 'rv_uranusPeak' },
  { km: 2723000000, key: 'rv_uranusPeak' },
  { km: 2723300000, key: 'rv_uranusPeak' },
  { km: 2723600000, key: 'rv_uranusPeak' },
  { km: 2723900000, key: 'rv_uranusPeak' },
  { km: 4350115000, key: 'rv_neptunePeak' },
  { km: 4350400000, key: 'rv_neptunePeak' },
  { km: 4350700000, key: 'rv_neptunePeak' },
  { km: 4351000000, key: 'rv_neptunePeak' },
  { km: 4351300000, key: 'rv_neptunePeak' },
  { km: 4351600000, key: 'rv_neptunePeak' },
  { km: 4351885000, key: 'rv_neptunePeak' },
  { km: 4500000000, key: 'rv_kuiper' },
  { km: 5300000000, key: 'rv_kuiper' },
  { km: 6200000000, key: 'rv_kuiper' },
  { km: 7100000000, key: 'rv_kuiper' },
  { km: 8000000000, key: 'rv_kuiper' },
  { km: 5905610000, key: 'rv_plutoPeak' },
  { km: 5905800000, key: 'rv_plutoPeak' },
  { km: 5905900000, key: 'rv_plutoPeak' },
  { km: 5906000000, key: 'rv_plutoPeak' },
  { km: 5906100000, key: 'rv_plutoPeak' },
  { km: 5906250000, key: 'rv_plutoPeak' },
  { km: 5906390000, key: 'rv_plutoPeak' },

  /* --- ВОЯДЖЕР --- */
  { km: 8000000000,   key: 'rv_interplanet' },
  { km: 15000000000,  key: 'rv_interplanet' },
  { km: 20000000000,  key: 'rv_voyager' },
  { km: 22000000000,  key: 'rv_voyager' },
  { km: 23500000000,  key: 'rv_voyager' },
  { km: 24000000000,  key: 'rv_voyager' },
  { km: 25000000000,  key: 'rv_voyager' },
  { km: 28000000000,  key: 'rv_voyager' },
  { km: 40000000000000, key: 'rv_interplanet' }
];

function reviewSliderToKm(pos) {
  const t = pos / 1000;
  const segments = REVIEW_TIMELINE.length - 1;
  const seg = t * segments;
  const i = Math.min(Math.floor(seg), segments - 1);
  const localT = seg - i;
  const a = REVIEW_TIMELINE[i].km;
  const b = REVIEW_TIMELINE[i + 1].km;
  if (a <= 0) return b * localT;
  const logA = Math.log10(a);
  const logB = Math.log10(b);
  return Math.pow(10, logA + (logB - logA) * localT);
}