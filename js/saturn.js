/* =========================================================
   SATURN 3D — Сатурн с кольцами + Титан
   Кольца в плоскости XZ. Наклон 26.73°.
   Появление:   1 273 640 000 км
   Пик:         1 275 000 000 км
   Исчезновение: 1 276 360 000 км
   ========================================================= */

const SATURN_RADIUS_KM   = 58232;
const SATURN_MIN_DIST_KM = 12000;
const SATURN_K           = 3.2;

const SATURN_APPEAR_KM = 1273640000;
const SATURN_PEAK_KM   = 1275000000;
const SATURN_VANISH_KM = 1276360000;

const saturnCanvas = document.getElementById('saturn3d');
const saturnRenderer = new THREE.WebGLRenderer({ canvas: saturnCanvas, alpha: true, antialias: true });
saturnRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
saturnRenderer.setClearColor(0x000000, 0);
saturnRenderer.outputEncoding = THREE.sRGBEncoding;
saturnRenderer.toneMapping = THREE.ACESFilmicToneMapping;
saturnRenderer.toneMappingExposure = 0.75;

const saturnScene = new THREE.Scene();
const saturnCamera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  20000
);
saturnCamera.position.set(0, 0, 3.2);
saturnCamera.lookAt(0, 0, 0);

const saturnSunDirection = new THREE.Vector3(0.7, 0.4, 0.5).normalize();

const saturnUniforms = {
  map:          { value: null },
  sunDirection: { value: saturnSunDirection.clone() },
  rimColor:     { value: new THREE.Color(0xffe0a8) },
  earthshine:   { value: new THREE.Color(0x3a2e1e) },
  rimStrength:  { value: 0.5 },
  earthshineStrength: { value: 0.18 }
};

const saturnMat = new THREE.ShaderMaterial({
  uniforms: saturnUniforms,
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
      if (base.r + base.g + base.b < 0.01) base = vec3(0.85, 0.75, 0.55);

      float sunDot = dot(vNormal, sunDirection);
      float lit = smoothstep(-0.35, 0.35, sunDot);

      vec3 color = base * (0.10 + 0.70 * lit);

      float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
      color += rimColor * fres * rimStrength * lit;

      float shadowZone = (1.0 - lit) * smoothstep(-0.3, -0.05, sunDot);
      color += earthshine * shadowZone * earthshineStrength;

      gl_FragColor = vec4(color, 1.0);
    }
  `
});

/* Группа */
const saturnGroup = new THREE.Group();
saturnScene.add(saturnGroup);

/* Планета */
const saturnMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), saturnMat);
saturnGroup.add(saturnMesh);

/* ---------- КОЛЬЦА ---------- */
const RING_INNER = 1.2;
const RING_OUTER = 2.4;

const ringGeo = new THREE.RingGeometry(RING_INNER, RING_OUTER, 128);

const ringPos = ringGeo.attributes.position;
const ringUv = ringGeo.attributes.uv;
const v3 = new THREE.Vector3();
for (let i = 0; i < ringPos.count; i++) {
  v3.fromBufferAttribute(ringPos, i);
  const r = v3.length();
  const u = (r - RING_INNER) / (RING_OUTER - RING_INNER);
  ringUv.setXY(i, u, 0.5);
}

const ringMat = new THREE.MeshBasicMaterial({
  map: null,
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  opacity: 1.0
});

const ringMesh = new THREE.Mesh(ringGeo, ringMat);

const ringGroup = new THREE.Group();
ringGroup.add(ringMesh);
ringGroup.rotation.x = Math.PI / 2;
saturnGroup.add(ringGroup);

/* ---------- ТИТАН — большой спутник Сатурна ---------- */
const titanMat = new THREE.MeshStandardMaterial({
  color: 0xffaa55,
  roughness: 0.95,
  metalness: 0.05
});
const titanMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), titanMat);
saturnScene.add(titanMesh);

/* Ореол */
const saturnHaloMat = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(0xffe8b0) },
    intensity: { value: 0.25 }
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

const saturnHalo = new THREE.Mesh(new THREE.SphereGeometry(1.06, 64, 64), saturnHaloMat);
saturnGroup.add(saturnHalo);

const saturnAmbient = new THREE.AmbientLight(0x3a2e1e, 0.4);
saturnScene.add(saturnAmbient);

const saturnSunLight = new THREE.DirectionalLight(0xfff0e0, 1.0);
saturnSunLight.position.set(0.7, 0.4, 0.5);
saturnScene.add(saturnSunLight);

/* Текстуры */
texLoader.load('textures/saturn.jpg', (tex) => {
  tex.anisotropy = saturnRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  saturnUniforms.map.value = tex;
  console.log('[THREE] Сатурн (планета) загружен');
}, undefined, () => console.warn('[THREE] saturn.jpg не найден'));

texLoader.load('textures/saturn_ring.png', (tex) => {
  tex.anisotropy = saturnRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  ringMat.map = tex;
  ringMat.needsUpdate = true;
  console.log('[THREE] Сатурн (кольца) загружен');
}, undefined, () => console.warn('[THREE] saturn_ring.png не найден'));

function resizeSaturn() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  saturnRenderer.setSize(w, h, false);
  saturnCamera.aspect = w / h;
  saturnCamera.updateProjectionMatrix();
}
resizeSaturn();
window.addEventListener('resize', resizeSaturn);

/* =========================================================
   ЛОГИКА САТУРНА
   ========================================================= */
function updateSaturn(km, dt) {
  dt = dt || 0.016;

  if (typeof orbitMode !== 'undefined' && orbitMode) return;

  if (km < SATURN_APPEAR_KM || km >= SATURN_VANISH_KM) {
    saturnCanvas.style.opacity = '0';
    return;
  }

  const fadeIn  = Math.min(1, (km - SATURN_APPEAR_KM) / ((SATURN_PEAK_KM - SATURN_APPEAR_KM) * 0.5));
  const fadeOut = Math.min(1, (SATURN_VANISH_KM - km) / ((SATURN_VANISH_KM - SATURN_PEAK_KM) * 0.5));
  const visibility = Math.min(fadeIn, fadeOut);

  if (visibility <= 0.01) {
    saturnCanvas.style.opacity = '0';
    return;
  }

  let scale;
  if (km <= SATURN_PEAK_KM) {
    const rawDist = Math.abs(km - SATURN_PEAK_KM);
    const distanceToSaturn = Math.max(rawDist, SATURN_MIN_DIST_KM);
    scale = (SATURN_RADIUS_KM / distanceToSaturn) * SATURN_K;
  } else {
    const k = (km - SATURN_PEAK_KM) / (SATURN_VANISH_KM - SATURN_PEAK_KM);
    const baseAtPeak = (SATURN_RADIUS_KM / SATURN_MIN_DIST_KM) * SATURN_K;
    scale = baseAtPeak + k * 0.5;
  }

  let xPos, yPos;
  if (km <= SATURN_PEAK_KM) {
    const t = (km - SATURN_APPEAR_KM) / (SATURN_PEAK_KM - SATURN_APPEAR_KM);
    xPos = 0;
    yPos = 0.5 - t * 0.2;
  } else {
    const k = (km - SATURN_PEAK_KM) / (SATURN_VANISH_KM - SATURN_PEAK_KM);
    xPos = k * k * 5.5;
    yPos = 0.3 + k * k * 3.0 + k * 0.3;
  }

  saturnCanvas.style.opacity = String(visibility);

  saturnGroup.position.set(xPos, yPos, 0);
  saturnGroup.scale.setScalar(scale);
  saturnGroup.rotation.z = 0.466;

  /* Вращение планеты */
  saturnMesh.rotation.y += 0.0008 * 2.27 * (dt / 0.016);

  /* Вращение колец */
  ringMesh.rotation.z += 0.0018 * (dt / 0.016);
  ringMat.opacity = 0.92 + Math.sin(globalTime * 0.8) * 0.08;

  /* Титан — на орбите снаружи колец */
  const titanAngle = globalTime * 0.15;
  const titanOrbit = scale * 4.5;
  titanMesh.position.set(
    xPos + Math.cos(titanAngle) * titanOrbit,
    yPos + Math.sin(titanAngle) * titanOrbit * 0.25,
    -0.3
  );
  titanMesh.scale.setScalar(scale * 0.18);
  titanMesh.rotation.y += 0.002 * (dt / 0.016);

  saturnHalo.position.copy(saturnMesh.position);
  saturnHalo.scale.setScalar(scale);

  saturnCamera.position.set(0, scale * 0.35, Math.max(3.2, scale * 2.2));
  saturnCamera.lookAt(xPos * 0.3, yPos * 0.3, 0);
  saturnCamera.updateProjectionMatrix();

  saturnRenderer.render(saturnScene, saturnCamera);
}