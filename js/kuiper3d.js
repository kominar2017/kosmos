/* =========================================================
   KUIPER 3D — пояс Койпера (4.5–8 млрд км)
   Оптимизация: 14 объектов вместо 22, Pixel Ratio 1
   ========================================================= */

const KUIPER_APPEAR_KM = 4500000000;
const KUIPER_VANISH_KM = 8000000000;

const kuiperCanvas = document.getElementById('kuiper3d');
const kuiperRenderer = new THREE.WebGLRenderer({
  canvas: kuiperCanvas,
  alpha: true,
  antialias: true
});
kuiperRenderer.setPixelRatio(1);
kuiperRenderer.setSize(window.innerWidth, window.innerHeight, false);
kuiperRenderer.setClearColor(0x000000, 0);

const kuiperScene = new THREE.Scene();
const kuiperCamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);
kuiperCamera.position.set(0, 0, 0);
kuiperCamera.lookAt(0, 0, -1);

/* ---------- Свет ---------- */
kuiperScene.add(new THREE.AmbientLight(0xffffff, 1.0));

const kuiperSun = new THREE.DirectionalLight(0xffffff, 1.5);
kuiperSun.position.set(3, 5, -2);
kuiperScene.add(kuiperSun);

/* ---------- Палитра: голубые тона ---------- */
const KUIPER_COLORS = [
  0xd8f0ff, 0xa8e0f8, 0x88c8f0, 0x68b0e0,
  0x98d0e8, 0xb8d8f0, 0xc8e0f8, 0x98c8e8,
  0xa8c8e0, 0xd0e8f8, 0xb0d0e8, 0xc0d8f0
];

/* ---------- Геометрия: неровный икосаэдр ---------- */
function randomKuiperGeometry() {
  const detailRoll = Math.random();
  let detail, baseShape;

  if (detailRoll < 0.4) {
    detail = 0;
    baseShape = 'faceted';
  } else if (detailRoll < 0.75) {
    detail = 1;
    baseShape = 'mixed';
  } else {
    detail = 2;
    baseShape = 'smooth';
  }

  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position;

  const formRoll = Math.random();
  let stretchX = 1, stretchY = 1, stretchZ = 1;
  if (formRoll < 0.25) {
    stretchX = 1.0 + Math.random() * 0.8;
    stretchY = 0.5 + Math.random() * 0.3;
    stretchZ = 0.5 + Math.random() * 0.3;
  } else if (formRoll < 0.5) {
    stretchY = 0.4 + Math.random() * 0.4;
  }

  const bumps = [];
  const bumpCount = 3 + Math.floor(Math.random() * 4);
  for (let b = 0; b < bumpCount; b++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    bumps.push({
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.sin(phi) * Math.sin(theta),
      z: Math.cos(phi),
      strength: 0.15 + Math.random() * 0.35
    });
  }

  const chips = [];
  const chipCount = Math.floor(Math.random() * 3);
  for (let c = 0; c < chipCount; c++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    chips.push({
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.sin(phi) * Math.sin(theta),
      z: Math.cos(phi),
      depth: 0.2 + Math.random() * 0.3
    });
  }

  const noiseScale = baseShape === 'faceted' ? 0.22 :
                     baseShape === 'mixed'   ? 0.10 : 0.04;

  const v = new THREE.Vector3();
  const offset = Math.random() * 100;

  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();

    v.x *= stretchX;
    v.y *= stretchY;
    v.z *= stretchZ;
    v.normalize();

    let radius = 1.0;

    for (const b of bumps) {
      const dot = v.x * b.x + v.y * b.y + v.z * b.z;
      const influence = Math.max(0, dot) ** 3;
      radius += influence * b.strength;
    }

    for (const c of chips) {
      const dot = v.x * c.x + v.y * c.y + v.z * c.z;
      const influence = Math.max(0, dot) ** 4;
      radius -= influence * c.depth;
    }

    const hash = Math.sin(
      (v.x * 12.9898 + v.y * 78.233 + v.z * 37.719 + offset) * 43758.5453
    ) * 0.5 + 0.5;
    radius += (hash - 0.5) * noiseScale;

    radius = Math.max(0.35, radius);

    pos.setXYZ(i, v.x * radius, v.y * radius, v.z * radius);
  }

  geo.computeVertexNormals();
  return geo;
}

/* ---------- Пул: 14 объектов (было 22) ---------- */
const KUIPER_COUNT = 14;
const kuipers = [];

const K_Z_NEAR = -50;
const K_Z_FAR  = -800;

function respawnKuiper(a) {
  const z = K_Z_NEAR + Math.random() * (K_Z_FAR - K_Z_NEAR);
  a.mesh.position.z = z;

  const distance = Math.abs(z);
  const visibleHeight = 2 * distance * Math.tan(Math.PI / 6);
  const visibleWidth = visibleHeight * kuiperCamera.aspect;

  a.mesh.position.x = (Math.random() - 0.5) * visibleWidth * 1.4;
  a.mesh.position.y = (Math.random() - 0.5) * visibleHeight * 1.4;

  const roll = Math.random();
  let size;
  if (roll < 0.5) {
    size = 0.5 + Math.random() * 1.5;
  } else if (roll < 0.85) {
    size = 2.5 + Math.random() * 3.5;
  } else {
    size = 6.0 + Math.random() * 6.0;
  }
  a.mesh.scale.setScalar(size);

  a.speedMul = 1 / Math.sqrt(size);

  a.rotSpeed = {
    x: (Math.random() - 0.5) * 0.8 * a.speedMul,
    y: (Math.random() - 0.5) * 0.8 * a.speedMul,
    z: (Math.random() - 0.5) * 0.8 * a.speedMul
  };

  a.mesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  );
}

function createKuiper() {
  const geo = randomKuiperGeometry();
  const color = KUIPER_COLORS[Math.floor(Math.random() * KUIPER_COLORS.length)];
  const mat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.75,
    metalness: 0.1,
    flatShading: true,
    emissive: color,
    emissiveIntensity: 0.08
  });
  const mesh = new THREE.Mesh(geo, mat);

  const a = {
    mesh,
    speedMul: 1,
    rotSpeed: { x: 0, y: 0, z: 0 }
  };
  respawnKuiper(a);
  return a;
}

function initKuiper() {
  for (let i = 0; i < KUIPER_COUNT; i++) {
    const a = createKuiper();
    a.mesh.position.z = K_Z_FAR * Math.random();
    kuipers.push(a);
    kuiperScene.add(a.mesh);
  }
}
initKuiper();

function resizeKuiper() {
  kuiperRenderer.setSize(window.innerWidth, window.innerHeight, false);
  kuiperCamera.aspect = window.innerWidth / window.innerHeight;
  kuiperCamera.updateProjectionMatrix();
}
window.addEventListener('resize', resizeKuiper);

/* =========================================================
   ОБНОВЛЕНИЕ
   ========================================================= */
function updateKuiper(km, dt) {
  dt = dt || 0.016;

  if (typeof orbitMode !== 'undefined' && orbitMode) return;

  if (km < KUIPER_APPEAR_KM || km >= KUIPER_VANISH_KM) {
    kuiperCanvas.style.display = 'none';
    return;
  }

  kuiperCanvas.style.display = 'block';
  kuiperCanvas.style.opacity = '1';

  const baseSpeed = starsSpeed * 2 + 3;

  for (const a of kuipers) {
    a.mesh.position.z += baseSpeed * a.speedMul;

    if (a.mesh.position.z > K_Z_NEAR) {
      respawnKuiper(a);
      a.mesh.position.z = K_Z_FAR;
      continue;
    }

    a.mesh.rotation.x += a.rotSpeed.x * dt;
    a.mesh.rotation.y += a.rotSpeed.y * dt;
    a.mesh.rotation.z += a.rotSpeed.z * dt;
  }

  kuiperRenderer.render(kuiperScene, kuiperCamera);
}