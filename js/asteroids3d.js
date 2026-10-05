/* =========================================================
   ASTEROIDS 3D — пояс астероидов между Марсом и Юпитером
   Диапазон: 300–500 млн км от Земли.
   3D-камни разной формы. Большие летят медленнее.
   ========================================================= */

const ASTEROIDS_APPEAR_KM = 300000000;
const ASTEROIDS_VANISH_KM = 500000000;

const asteroidsCanvas = document.getElementById('asteroids3d');
const asteroidsRenderer = new THREE.WebGLRenderer({
  canvas: asteroidsCanvas,
  alpha: true,
  antialias: true
});
asteroidsRenderer.setPixelRatio(1);
asteroidsRenderer.setSize(window.innerWidth, window.innerHeight, false);
asteroidsRenderer.setClearColor(0x000000, 0);

const asteroidsScene = new THREE.Scene();
const asteroidsCamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);
asteroidsCamera.position.set(0, 0, 0);
asteroidsCamera.lookAt(0, 0, -1);

/* ---------- Свет ---------- */
asteroidsScene.add(new THREE.AmbientLight(0xffffff, 1.0));

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(3, 5, -2);
asteroidsScene.add(sunLight);

/* ---------- Палитра ---------- */
const COLOR_PALETTES = [
  0xa89888, 0x8a7a6a, 0x6a5e50, 0x9a8a78,
  0x7a6a5a, 0xb0a090, 0x605548, 0x8e7d6b,
  0x9a6a55, 0x8090a0, 0x706860, 0xa89a80
];

/* ---------- Геометрия: уникальный камень ---------- */
function randomAsteroidGeometry() {
  const detailRoll = Math.random();
  let detail, baseShape;

  if (detailRoll < 0.35) {
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
  if (formRoll < 0.2) {
    stretchX = 1.0 + Math.random() * 0.8;
    stretchY = 0.5 + Math.random() * 0.3;
    stretchZ = 0.5 + Math.random() * 0.3;
  } else if (formRoll < 0.4) {
    stretchY = 0.4 + Math.random() * 0.3;
  } else if (formRoll < 0.6) {
    stretchY = 1.0 + Math.random() * 0.8;
    stretchX = 0.5 + Math.random() * 0.3;
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

  const noiseScale = baseShape === 'faceted' ? 0.25 :
                     baseShape === 'mixed'   ? 0.12 : 0.05;

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

/* ---------- Пул ---------- */
const ASTEROID_COUNT = 18;
const asteroids = [];

const Z_NEAR = -50;
const Z_FAR  = -800;

function respawnAsteroid(a) {
  const z = Z_NEAR + Math.random() * (Z_FAR - Z_NEAR);
  a.mesh.position.z = z;

  const distance = Math.abs(z);
  const visibleHeight = 2 * distance * Math.tan(Math.PI / 6);
  const visibleWidth = visibleHeight * asteroidsCamera.aspect;

  a.mesh.position.x = (Math.random() - 0.5) * visibleWidth * 1.4;
  a.mesh.position.y = (Math.random() - 0.5) * visibleHeight * 1.4;

  const roll = Math.random();
  let size;
  if (roll < 0.5) {
    size = 0.5 + Math.random() * 1.5;
  } else if (roll < 0.85) {
    size = 2.5 + Math.random() * 3.0;
  } else {
    size = 6.0 + Math.random() * 6.0;
  }
  a.mesh.scale.setScalar(size);

  a.speedMul = 1 / Math.sqrt(size);

  a.rotSpeed = {
    x: (Math.random() - 0.5) * 1.8 * a.speedMul,
    y: (Math.random() - 0.5) * 1.8 * a.speedMul,
    z: (Math.random() - 0.5) * 1.8 * a.speedMul
  };

  a.mesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  );
}

function createAsteroid() {
  const geo = randomAsteroidGeometry();
  const color = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
  const mat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true
  });
  const mesh = new THREE.Mesh(geo, mat);

  const a = {
    mesh,
    speedMul: 1,
    rotSpeed: { x: 0, y: 0, z: 0 }
  };
  respawnAsteroid(a);
  return a;
}

function initAsteroids() {
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    const a = createAsteroid();
    a.mesh.position.z = Z_FAR * Math.random();
    asteroids.push(a);
    asteroidsScene.add(a.mesh);
  }
}
initAsteroids();

function resizeAsteroids() {
  asteroidsRenderer.setSize(window.innerWidth, window.innerHeight, false);
  asteroidsCamera.aspect = window.innerWidth / window.innerHeight;
  asteroidsCamera.updateProjectionMatrix();
}
window.addEventListener('resize', resizeAsteroids);

/* =========================================================
   ОБНОВЛЕНИЕ
   ========================================================= */
function updateAsteroids(km, dt) {
  dt = dt || 0.016;

  if (typeof orbitMode !== 'undefined' && orbitMode) return;

  if (km < ASTEROIDS_APPEAR_KM || km >= ASTEROIDS_VANISH_KM) {
    asteroidsCanvas.style.display = 'none';
    return;
  }

  asteroidsCanvas.style.display = 'block';
  asteroidsCanvas.style.opacity = '1';

  const baseSpeed = starsSpeed * 2 + 3;

  for (const a of asteroids) {
    a.mesh.position.z += baseSpeed * a.speedMul;

    if (a.mesh.position.z > Z_NEAR) {
      respawnAsteroid(a);
      a.mesh.position.z = Z_FAR;
      continue;
    }

    a.mesh.rotation.x += a.rotSpeed.x * dt;
    a.mesh.rotation.y += a.rotSpeed.y * dt;
    a.mesh.rotation.z += a.rotSpeed.z * dt;
  }

  asteroidsRenderer.render(asteroidsScene, asteroidsCamera);
}