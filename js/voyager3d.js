/* =========================================================
   VOYAGER 3D — Вояджер-1. Pixel Ratio 1.5
   ========================================================= */

const VOYAGER_APPEAR_KM = 20000000000;
const VOYAGER_PEAK_KM   = 24000000000;
const VOYAGER_VANISH_KM = 28000000000;

const voyagerCanvas = document.getElementById('voyager3d');
const voyagerRenderer = new THREE.WebGLRenderer({ canvas: voyagerCanvas, alpha: true, antialias: true });
voyagerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
voyagerRenderer.setClearColor(0x000000, 0);
voyagerRenderer.outputEncoding = THREE.sRGBEncoding;

const voyagerScene = new THREE.Scene();
const voyagerCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 5000);
voyagerCamera.position.set(0, 0, 0);
voyagerCamera.lookAt(0, 0, -1);

voyagerScene.add(new THREE.AmbientLight(0xffffff, 1.2));
const voyagerSun = new THREE.DirectionalLight(0xfff0e0, 1.6);
voyagerSun.position.set(3, 5, -2);
voyagerScene.add(voyagerSun);
const voyagerFill = new THREE.DirectionalLight(0x6080c0, 0.6);
voyagerFill.position.set(-3, -2, -2);
voyagerScene.add(voyagerFill);

let voyagerMesh = null;
let voyagerLoaded = false;

const VOYAGER_KEY_POINTS = [
  [ 20000000000,  -120,   +60,  -1500],
  [ 22000000000,   -60,   +40,   -700],
  [ 23500000000,   -10,   +15,   -250],
  [ 24000000000,    -5,   -10,    -80],
  [ 25000000000,   +30,   -25,   +150],
  [ 28000000000,  +100,   -40,   +350]
];

function getVoyagerTrajectory(km) {
  for (let i = 0; i < VOYAGER_KEY_POINTS.length - 1; i++) {
    const a = VOYAGER_KEY_POINTS[i];
    const b = VOYAGER_KEY_POINTS[i + 1];
    if (km >= a[0] && km <= b[0]) {
      const t = (km - a[0]) / (b[0] - a[0]);
      return {
        x: a[1] + t * (b[1] - a[1]),
        y: a[2] + t * (b[2] - a[2]),
        z: a[3] + t * (b[3] - a[3])
      };
    }
  }
  if (km < VOYAGER_KEY_POINTS[0][0]) {
    return { x: VOYAGER_KEY_POINTS[0][1], y: VOYAGER_KEY_POINTS[0][2], z: VOYAGER_KEY_POINTS[0][3] };
  }
  const last = VOYAGER_KEY_POINTS[VOYAGER_KEY_POINTS.length - 1];
  return { x: last[1], y: last[2], z: last[3] };
}

const voyagerLoader = new THREE.GLTFLoader();
voyagerLoader.load('models/voyager.glb', (gltf) => {
  voyagerMesh = gltf.scene;

  const box = new THREE.Box3().setFromObject(voyagerMesh);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const targetSize = 80;
  voyagerMesh.scale.setScalar(targetSize / maxDim);

  voyagerMesh.traverse((node) => {
    if (node.isMesh && node.material) {
      node.material.roughness = 0.6;
      node.material.metalness = 0.3;
      if (node.material.map) {
        node.material.map.anisotropy = voyagerRenderer.capabilities.getMaxAnisotropy();
        node.material.map.minFilter = THREE.LinearMipmapLinearFilter;
        node.material.map.magFilter = THREE.LinearFilter;
      }
      node.material.emissive = new THREE.Color(0x223344);
      node.material.emissiveIntensity = 0.15;
    }
  });

  const start = getVoyagerTrajectory(VOYAGER_APPEAR_KM);
  voyagerMesh.position.set(start.x, start.y, start.z);
  voyagerScene.add(voyagerMesh);
  voyagerLoaded = true;

  console.log('[THREE] Вояджер загружен');

  if (typeof notifyVoyagerLoaded === 'function') notifyVoyagerLoaded();
}, undefined, () => {
  console.warn('[THREE] voyager.glb не найден');
  if (typeof notifyVoyagerFailed === 'function') notifyVoyagerFailed();
});

function resizeVoyager() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio, 1.5);
  voyagerRenderer.setPixelRatio(dpr);
  voyagerRenderer.setSize(w, h, false);
  voyagerCamera.aspect = w / h;
  voyagerCamera.updateProjectionMatrix();
}
resizeVoyager();
window.addEventListener('resize', resizeVoyager);
window.addEventListener('load', resizeVoyager);

function updateVoyager(km, dt) {
  dt = dt || 0.016;
  if (typeof orbitMode !== 'undefined' && orbitMode) return;

  if (!voyagerLoaded || !voyagerMesh) {
    voyagerCanvas.style.opacity = '0';
    return;
  }

  if (km < VOYAGER_APPEAR_KM || km > VOYAGER_VANISH_KM) {
    voyagerCanvas.style.opacity = '0';
    return;
  }

  voyagerCanvas.style.display = 'block';

  const pos = getVoyagerTrajectory(km);
  voyagerMesh.position.set(pos.x, pos.y, pos.z);

  voyagerMesh.rotation.y += 0.0015 * (dt / 0.016);
  voyagerMesh.rotation.x = Math.sin(globalTime * 0.5) * 0.08;
  voyagerMesh.rotation.z = 0.05;

  let opacity = 1;
  if (pos.z > 100) {
    opacity = Math.max(0, 1 - (pos.z - 100) / 200);
  }

  const fadeIn  = Math.min(1, (km - VOYAGER_APPEAR_KM) / 1000000000);
  const fadeOut = Math.min(1, (VOYAGER_VANISH_KM - km) / 1000000000);
  voyagerCanvas.style.opacity = String(Math.min(opacity, fadeIn, fadeOut));

  voyagerRenderer.render(voyagerScene, voyagerCamera);
}