/* =========================================================
   MARS 3D — Марс + Фобос и Деймос (маленькие)
   Радиус: 3389.5 км.
   Появление:   224 574 000 км
   Пик:         225 000 000 км
   Исчезновение: 225 232 000 км
   Вращение: сутки 24ч37м. Наклон 25.2°.
   ========================================================= */

const MARS_RADIUS_KM   = 3389.5;
const MARS_MIN_DIST_KM = 8000;
const MARS_K           = 3.2;

const MARS_APPEAR_KM = 224574000;
const MARS_PEAK_KM   = 225000000;
const MARS_VANISH_KM = 225232000;

const marsCanvas = document.getElementById('mars3d');
const marsRenderer = new THREE.WebGLRenderer({ canvas: marsCanvas, alpha: true, antialias: true });
marsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
marsRenderer.setClearColor(0x000000, 0);
marsRenderer.outputEncoding = THREE.sRGBEncoding;
marsRenderer.toneMapping = THREE.ACESFilmicToneMapping;
marsRenderer.toneMappingExposure = 1.0;

const marsScene = new THREE.Scene();
const marsCamera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  20000
);
marsCamera.position.set(0, 0, 3.2);
marsCamera.lookAt(0, 0, 0);

const marsSunDirection = new THREE.Vector3(0.7, 0.4, 0.5).normalize();

const marsUniforms = {
  map:          { value: null },
  sunDirection: { value: marsSunDirection.clone() },
  rimColor:     { value: new THREE.Color(0xffb890) },
  earthshine:   { value: new THREE.Color(0x4a2a1a) },
  rimStrength:  { value: 0.55 },
  earthshineStrength: { value: 0.25 }
};

const marsMat = new THREE.ShaderMaterial({
  uniforms: marsUniforms,
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform sampler2D map;
    uniform vec3 sunDirection;
    uniform vec3 rimColor;
    uniform vec3 earthshine;
    uniform float rimStrength;
    uniform float earthshineStrength;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;

    void main() {
      vec3 base = texture2D(map, vUv).rgb;
      if (base.r + base.g + base.b < 0.01) base = vec3(0.65, 0.30, 0.15);

      float sunDot = dot(vNormal, sunDirection);
      float lit = smoothstep(-0.25, 0.25, sunDot);

      vec3 color = base * (0.10 + 1.10 * lit);

      float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
      color += rimColor * fres * rimStrength * lit;

      float shadowZone = (1.0 - lit) * smoothstep(-0.3, -0.05, sunDot);
      color += earthshine * shadowZone * earthshineStrength;

      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const marsMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), marsMat);
marsScene.add(marsMesh);

/* ---------- ФОБОС И ДЕЙМОС — очень маленькие ---------- */
const phobosMat = new THREE.MeshStandardMaterial({
  color: 0x5a4a3a, roughness: 0.95, metalness: 0.05
});
const deimosMat = new THREE.MeshStandardMaterial({
  color: 0x4a3a2a, roughness: 0.95, metalness: 0.05
});

const phobosMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), phobosMat);
const deimosMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), deimosMat);

marsScene.add(phobosMesh);
marsScene.add(deimosMesh);

const marsAmbient = new THREE.AmbientLight(0x3a2018, 0.4);
marsScene.add(marsAmbient);

const marsSunLight = new THREE.DirectionalLight(0xfff0e0, 1.0);
marsSunLight.position.set(0.7, 0.4, 0.5);
marsScene.add(marsSunLight);

/* Ореол */
const marsHaloMat = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(0xffa878) },
    intensity: { value: 0.30 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float intensity;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float facing = dot(vNormal, viewDir);
      float rim = pow(1.0 - abs(facing), 4.5);
      gl_FragColor = vec4(color, rim * intensity);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  depthWrite: false
});

const marsHalo = new THREE.Mesh(new THREE.SphereGeometry(1.06, 64, 64), marsHaloMat);
marsScene.add(marsHalo);

/* Текстура */
texLoader.load('textures/mars.jpg', (tex) => {
  tex.anisotropy = marsRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  marsUniforms.map.value = tex;
  console.log('[THREE] Марс загружен');
}, undefined, () => console.warn('[THREE] mars.jpg не найден'));

/* Ресайз */
function resizeMars() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  marsRenderer.setSize(w, h, false);
  marsCamera.aspect = w / h;
  marsCamera.updateProjectionMatrix();
}
resizeMars();
window.addEventListener('resize', resizeMars);

/* =========================================================
   ЛОГИКА МАРСА
   ========================================================= */
function updateMars(km, dt) {
  dt = dt || 0.016;

  if (typeof orbitMode !== 'undefined' && orbitMode) return;

  if (km < MARS_APPEAR_KM || km >= MARS_VANISH_KM) {
    marsCanvas.style.opacity = '0';
    return;
  }

  const fadeIn  = Math.min(1, (km - MARS_APPEAR_KM) / ((MARS_PEAK_KM - MARS_APPEAR_KM) * 0.5));
  const fadeOut = Math.min(1, (MARS_VANISH_KM - km) / ((MARS_VANISH_KM - MARS_PEAK_KM) * 0.5));
  const visibility = Math.min(fadeIn, fadeOut);

  if (visibility <= 0.01) {
    marsCanvas.style.opacity = '0';
    return;
  }

  let scale;
  if (km <= MARS_PEAK_KM) {
    const rawDist = Math.abs(km - MARS_PEAK_KM);
    const distanceToMars = Math.max(rawDist, MARS_MIN_DIST_KM);
    scale = (MARS_RADIUS_KM / distanceToMars) * MARS_K;
  } else {
    const k = (km - MARS_PEAK_KM) / (MARS_VANISH_KM - MARS_PEAK_KM);
    const baseAtPeak = (MARS_RADIUS_KM / MARS_MIN_DIST_KM) * MARS_K;
    scale = baseAtPeak + k * 0.5;
  }

  let xPos, yPos;
  if (km <= MARS_PEAK_KM) {
    const t = (km - MARS_APPEAR_KM) / (MARS_PEAK_KM - MARS_APPEAR_KM);
    xPos = 0;
    yPos = 0.5 - t * 0.2;
  } else {
    const k = (km - MARS_PEAK_KM) / (MARS_VANISH_KM - MARS_PEAK_KM);
    xPos = k * k * 5.5;
    yPos = 0.3 + k * k * 3.0 + k * 0.3;
  }

  marsCanvas.style.opacity = String(visibility);

  marsMesh.position.set(xPos, yPos, 0);
  marsMesh.scale.setScalar(scale);
  marsMesh.rotation.y += 0.0007784 * (dt / 0.016);
  marsMesh.rotation.x += 0.00012 * (dt / 0.016);
  marsMesh.rotation.z = 0.44;

  /* Фобос и Деймос — очень маленькие, кружат рядом */
  const phobosAngle = globalTime * 0.6;
  const deimosAngle = globalTime * 0.4;

  phobosMesh.position.set(
    xPos + Math.cos(phobosAngle) * scale * 1.6,
    yPos + Math.sin(phobosAngle) * scale * 0.8,
    -0.15
  );
  phobosMesh.scale.setScalar(scale * 0.02);
  phobosMesh.rotation.x += 0.003 * (dt / 0.016);
  phobosMesh.rotation.y += 0.004 * (dt / 0.016);

  deimosMesh.position.set(
    xPos + Math.cos(deimosAngle) * scale * 2.4,
    yPos + Math.sin(deimosAngle) * scale * 1.2,
    -0.2
  );
  deimosMesh.scale.setScalar(scale * 0.014);
  deimosMesh.rotation.x += 0.002 * (dt / 0.016);
  deimosMesh.rotation.y += 0.003 * (dt / 0.016);

  marsHalo.position.copy(marsMesh.position);
  marsHalo.scale.setScalar(scale);

  marsCamera.position.set(0, 0, Math.max(3.2, scale * 1.5));
  marsCamera.lookAt(xPos * 0.3, yPos * 0.3, 0);
  marsCamera.updateProjectionMatrix();

  marsRenderer.render(marsScene, marsCamera);
}