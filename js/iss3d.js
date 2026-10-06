/* =========================================================
   ISS 3D — МКС.
   Баланс: качество + FPS.
   pixelRatio 1.5, antialias on, anisotropy 4
   ========================================================= */

const ISS_APPEAR_KM = 385;
const ISS_PEAK_KM   = 398;
const ISS_VANISH_KM = 405;

const issCanvas = document.getElementById('iss3d');
const issRenderer = new THREE.WebGLRenderer({
  canvas: issCanvas,
  alpha: true,
  antialias: true               /* ← вернули для качества краёв */
});
issRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));   /* ← вернули 1.5 */
issRenderer.setClearColor(0x000000, 0);
issRenderer.outputEncoding = THREE.sRGBEncoding;

const issScene = new THREE.Scene();
const issCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 5000);
issCamera.position.set(0, 0, 0);
issCamera.lookAt(0, 0, -1);

issScene.add(new THREE.AmbientLight(0xffffff, 1.0));
const issSun = new THREE.DirectionalLight(0xfff0e0, 1.6);
issSun.position.set(3, 5, -2);
issScene.add(issSun);
const issFill = new THREE.DirectionalLight(0x6080c0, 0.5);
issFill.position.set(-3, -2, -2);
issScene.add(issFill);

let issMesh = null;
let issLoaded = false;

const KEY_POINTS = [
  [ 385,  -120,   +60,  -1500],
  [ 390,   -60,   +40,   -700],
  [ 395,   -10,   +15,   -250],
  [ 398,    -5,   -10,    -80],
  [ 401,   +30,   -25,   +150],
  [ 405,  +100,   -40,   +350]
];

function getTrajectory(km) {
  for (let i = 0; i < KEY_POINTS.length - 1; i++) {
    const a = KEY_POINTS[i];
    const b = KEY_POINTS[i + 1];
    if (km >= a[0] && km <= b[0]) {
      const t = (km - a[0]) / (b[0] - a[0]);
      return {
        x: a[1] + t * (b[1] - a[1]),
        y: a[2] + t * (b[2] - a[2]),
        z: a[3] + t * (b[3] - a[3])
      };
    }
  }
  if (km < KEY_POINTS[0][0]) {
    return { x: KEY_POINTS[0][1], y: KEY_POINTS[0][2], z: KEY_POINTS[0][3] };
  }
  const last = KEY_POINTS[KEY_POINTS.length - 1];
  return { x: last[1], y: last[2], z: last[3] };
}

const issLoader = new THREE.GLTFLoader();
issLoader.load('models/iss.glb', (gltf) => {
  issMesh = gltf.scene;

  const box = new THREE.Box3().setFromObject(issMesh);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const targetSize = 80;            /* компромисс: было 100 → 60 (мыло) → 80 */
  issMesh.scale.setScalar(targetSize / maxDim);

  issMesh.traverse((node) => {
    if (node.isMesh && node.material) {
      /* Клонируем материал, чтобы не мутировать shared */
      node.material = node.material.clone();

      node.material.roughness = 0.7;
      node.material.metalness = 0.2;

      /* Упрощаем emissive — оставляем лёгкое свечение */
      node.material.emissive = new THREE.Color(0x1a1a2a);
      node.material.emissiveIntensity = 0.15;

      if (node.material.map) {
        node.material.map.anisotropy = 4;   /* ← было 16 (жрёт GPU), ставим 4 — компромисс */
        node.material.map.minFilter = THREE.LinearMipmapLinearFilter;
        node.material.map.magFilter = THREE.LinearFilter;
      }
    }
  });

  const start = getTrajectory(ISS_APPEAR_KM);
  issMesh.position.set(start.x, start.y, start.z);
  issScene.add(issMesh);
  issLoaded = true;

  console.log('[THREE] МКС загружена');

  if (typeof notifyISSLoaded === 'function') notifyISSLoaded();
}, undefined, () => {
  console.warn('[THREE] iss.glb не найден');
  if (typeof notifyISSFailed === 'function') notifyISSFailed();
});

function resizeISS() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio, 1.5);   /* ← вернули 1.5 */
  issRenderer.setPixelRatio(dpr);
  issRenderer.setSize(w, h, false);
  issCamera.aspect = w / h;
  issCamera.updateProjectionMatrix();
}
resizeISS();
window.addEventListener('resize', resizeISS);
window.addEventListener('load', resizeISS);
window.addEventListener('orientationchange', resizeISS);

function updateISS(km, dt) {
  dt = dt || 0.016;
  if (typeof orbitMode !== 'undefined' && orbitMode) return;

  if (!issLoaded || !issMesh) {
    issCanvas.style.display = 'none';
    return;
  }

  if (km < ISS_APPEAR_KM || km > ISS_VANISH_KM) {
    issCanvas.style.display = 'none';
    return;
  }

  issCanvas.style.display = 'block';

  const pos = getTrajectory(km);
  issMesh.position.set(pos.x, pos.y, pos.z);

  issMesh.rotation.y += 0.0015 * (dt / 0.016);
  const tGlobal = (typeof globalTime === 'number') ? globalTime : 0;
  issMesh.rotation.x = Math.sin(tGlobal * 0.5) * 0.08;
  issMesh.rotation.z = 0.05;

  let opacity = 1;
  if (pos.z > 100) {
    opacity = Math.max(0, 1 - (pos.z - 100) / 200);
  }

  const fadeIn  = Math.min(1, (km - ISS_APPEAR_KM) / 1.5);
  const fadeOut = Math.min(1, (ISS_VANISH_KM - km) / 1.5);
  issCanvas.style.opacity = String(Math.min(opacity, fadeIn, fadeOut));

  issRenderer.render(issScene, issCamera);
}