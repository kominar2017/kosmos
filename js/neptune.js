/* =========================================================
   NEPTUNE 3D — Нептун с кольцами + Тритон
   Pixel Ratio 1.5, сфера 48×48
   ========================================================= */

const NEPTUNE_RADIUS_KM   = 24622;
const NEPTUNE_MIN_DIST_KM = 10000;
const NEPTUNE_K           = 3.2;

const NEPTUNE_APPEAR_KM = 4350115000;
const NEPTUNE_PEAK_KM   = 4351000000;
const NEPTUNE_VANISH_KM = 4351885000;

const neptuneCanvas = document.getElementById('neptune3d');
const neptuneRenderer = new THREE.WebGLRenderer({ canvas: neptuneCanvas, alpha: true, antialias: true });
neptuneRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
neptuneRenderer.setClearColor(0x000000, 0);
neptuneRenderer.outputEncoding = THREE.sRGBEncoding;
neptuneRenderer.toneMapping = THREE.ACESFilmicToneMapping;
neptuneRenderer.toneMappingExposure = 0.85;

const neptuneScene = new THREE.Scene();
const neptuneCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
neptuneCamera.position.set(0, 0, 3.2);
neptuneCamera.lookAt(0, 0, 0);

const neptuneSunDirection = new THREE.Vector3(0.7, 0.4, 0.5).normalize();

const neptuneUniforms = {
  map:          { value: null },
  sunDirection: { value: neptuneSunDirection.clone() },
  rimColor:     { value: new THREE.Color(0x6080ff) },
  earthshine:   { value: new THREE.Color(0x0a1a3a) },
  rimStrength:  { value: 0.55 },
  earthshineStrength: { value: 0.2 }
};

const neptuneMat = new THREE.ShaderMaterial({
  uniforms: neptuneUniforms,
  vertexShader: `
    varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewDir; varying vec3 vWorldPos;
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
    uniform sampler2D map; uniform vec3 sunDirection; uniform vec3 rimColor; uniform vec3 earthshine;
    uniform float rimStrength; uniform float earthshineStrength;
    varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewDir; varying vec3 vWorldPos;
    void main() {
      vec3 base = texture2D(map, vUv).rgb;
      if (base.r + base.g + base.b < 0.01) base = vec3(0.2, 0.35, 0.85);
      float sunDot = dot(vNormal, sunDirection);
      float lit = smoothstep(-0.35, 0.35, sunDot);
      vec3 color = base * (0.10 + 0.85 * lit);
      float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
      color += rimColor * fres * rimStrength * lit;
      float shadowZone = (1.0 - lit) * smoothstep(-0.3, -0.05, sunDot);
      color += earthshine * shadowZone * earthshineStrength;
      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const neptuneGroup = new THREE.Group();
neptuneScene.add(neptuneGroup);

const neptuneMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), neptuneMat);
neptuneGroup.add(neptuneMesh);

const NEPTUNE_RING_INNER = 1.7;
const NEPTUNE_RING_OUTER = 2.4;

const nRingGeo = new THREE.RingGeometry(NEPTUNE_RING_INNER, NEPTUNE_RING_OUTER, 96);

const nRingPos = nRingGeo.attributes.position;
const nRingUv = nRingGeo.attributes.uv;
const v3n = new THREE.Vector3();
for (let i = 0; i < nRingPos.count; i++) {
  v3n.fromBufferAttribute(nRingPos, i);
  const r = v3n.length();
  const u = (r - NEPTUNE_RING_INNER) / (NEPTUNE_RING_OUTER - NEPTUNE_RING_INNER);
  nRingUv.setXY(i, u, 0.5);
}

const nRingMat = new THREE.MeshBasicMaterial({
  color: 0x5a6a8a, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.35
});

const nRingMesh = new THREE.Mesh(nRingGeo, nRingMat);

const nRingGroup = new THREE.Group();
nRingGroup.add(nRingMesh);
nRingGroup.rotation.x = Math.PI / 2;
neptuneGroup.add(nRingGroup);

const tritonMat = new THREE.MeshStandardMaterial({ color: 0xb8b0a8, roughness: 0.9, metalness: 0.05 });
const tritonMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 24), tritonMat);
neptuneScene.add(tritonMesh);

const neptuneHaloMat = new THREE.ShaderMaterial({
  uniforms: { color: { value: new THREE.Color(0x4060c0) }, intensity: { value: 0.3 } },
  vertexShader: `
    varying vec3 vNormal; varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color; uniform float intensity;
    varying vec3 vNormal; varying vec3 vPosition;
    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float facing = dot(vNormal, viewDir);
      float rim = pow(1.0 - abs(facing), 4.5);
      gl_FragColor = vec4(color, rim * intensity);
    }
  `,
  transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false
});

const neptuneHalo = new THREE.Mesh(new THREE.SphereGeometry(1.06, 32, 32), neptuneHaloMat);
neptuneGroup.add(neptuneHalo);

neptuneScene.add(new THREE.AmbientLight(0x0a1a3a, 0.5));
const neptuneSunLight = new THREE.DirectionalLight(0xfff0e0, 1.0);
neptuneSunLight.position.set(0.7, 0.4, 0.5);
neptuneScene.add(neptuneSunLight);

texLoader.load('textures/neptune.jpg', (tex) => {
  tex.anisotropy = neptuneRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  neptuneUniforms.map.value = tex;
  console.log('[THREE] Нептун загружен');
}, undefined, () => console.warn('[THREE] neptune.jpg не найден'));

function resizeNeptune() {
  const w = window.innerWidth, h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio, 1.5);
  neptuneRenderer.setPixelRatio(dpr);
  neptuneRenderer.setSize(w, h, false);
  neptuneCamera.aspect = w / h;
  neptuneCamera.updateProjectionMatrix();
}
resizeNeptune();
window.addEventListener('resize', resizeNeptune);

function updateNeptune(km, dt) {
  dt = dt || 0.016;
  if (typeof orbitMode !== 'undefined' && orbitMode) return;
  if (km < NEPTUNE_APPEAR_KM || km >= NEPTUNE_VANISH_KM) {
    neptuneCanvas.style.opacity = '0';
    return;
  }
  const fadeIn  = Math.min(1, (km - NEPTUNE_APPEAR_KM) / ((NEPTUNE_PEAK_KM - NEPTUNE_APPEAR_KM) * 0.5));
  const fadeOut = Math.min(1, (NEPTUNE_VANISH_KM - km) / ((NEPTUNE_VANISH_KM - NEPTUNE_PEAK_KM) * 0.5));
  const visibility = Math.min(fadeIn, fadeOut);
  if (visibility <= 0.01) { neptuneCanvas.style.opacity = '0'; return; }

  let scale;
  if (km <= NEPTUNE_PEAK_KM) {
    const rawDist = Math.abs(km - NEPTUNE_PEAK_KM);
    const distanceToNeptune = Math.max(rawDist, NEPTUNE_MIN_DIST_KM);
    scale = (NEPTUNE_RADIUS_KM / distanceToNeptune) * NEPTUNE_K;
  } else {
    const k = (km - NEPTUNE_PEAK_KM) / (NEPTUNE_VANISH_KM - NEPTUNE_PEAK_KM);
    const baseAtPeak = (NEPTUNE_RADIUS_KM / NEPTUNE_MIN_DIST_KM) * NEPTUNE_K;
    scale = baseAtPeak + k * 0.5;
  }

  let xPos, yPos;
  if (km <= NEPTUNE_PEAK_KM) {
    const t = (km - NEPTUNE_APPEAR_KM) / (NEPTUNE_PEAK_KM - NEPTUNE_APPEAR_KM);
    xPos = 0; yPos = 0.5 - t * 0.2;
  } else {
    const k = (km - NEPTUNE_PEAK_KM) / (NEPTUNE_VANISH_KM - NEPTUNE_PEAK_KM);
    xPos = k * k * 5.5; yPos = 0.3 + k * k * 3.0 + k * 0.3;
  }

  neptuneCanvas.style.opacity = String(visibility);
  neptuneGroup.position.set(xPos, yPos, 0);
  neptuneGroup.scale.setScalar(scale);
  neptuneGroup.rotation.z = 0.4943;

  neptuneMesh.rotation.y += 0.0008 * 1.49 * (dt / 0.016);
  nRingMesh.rotation.z += 0.0006 * (dt / 0.016);

  const tritonAngle = globalTime * 0.08;
  tritonMesh.position.set(
    xPos + Math.cos(tritonAngle) * scale * 3.5,
    yPos + Math.sin(tritonAngle) * scale * 3.5,
    -0.3
  );
  tritonMesh.scale.setScalar(scale * 0.1);
  tritonMesh.rotation.y += 0.002 * (dt / 0.016);

  neptuneHalo.position.copy(neptuneMesh.position);
  neptuneHalo.scale.setScalar(scale);

  neptuneCamera.position.set(0, scale * 0.4, Math.max(3.2, scale * 2.6));
  neptuneCamera.lookAt(xPos * 0.3, yPos * 0.3, 0);
  neptuneCamera.updateProjectionMatrix();

  neptuneRenderer.render(neptuneScene, neptuneCamera);
}