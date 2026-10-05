/* =========================================================
   MOON 3D — до пика ФИЗИКА, после пика ХУДОЖЕСТВЕННЫЙ уход
   к Солнцу (правый верхний угол). Размер после пика растёт —
   эффект пролёта вплотную.
   Вращение увеличено (×10) для динамики + лёгкое покачивание.
   ========================================================= */

const MOON_RADIUS_KM = 1737;
const MOON_MIN_DIST_KM = 4737;   // 3000 км от поверхности + радиус
const MOON_K = 3.2;

const moonCanvas = document.getElementById('moon3d');
const moonRenderer = new THREE.WebGLRenderer({ canvas: moonCanvas, alpha: true, antialias: true });
moonRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
moonRenderer.setClearColor(0x000000, 0);
moonRenderer.outputEncoding = THREE.sRGBEncoding;
moonRenderer.toneMapping = THREE.ACESFilmicToneMapping;
moonRenderer.toneMappingExposure = 1.0;

const moonScene = new THREE.Scene();
const moonCamera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  20000
);
moonCamera.position.set(0, 0, 3.2);
moonCamera.lookAt(0, 0, 0);

const moonSunDirection = new THREE.Vector3(0.7, 0.4, 0.5).normalize();

const moonUniforms = {
  map:          { value: null },
  sunDirection: { value: moonSunDirection.clone() },
  rimColor:     { value: new THREE.Color(0xd8e2f2) },
  earthshine:   { value: new THREE.Color(0x3d5b8f) },
  rimStrength:  { value: 0.65 },
  earthshineStrength: { value: 0.35 }
};

const moonMat = new THREE.ShaderMaterial({
  uniforms: moonUniforms,
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

      float sunDot = dot(vNormal, sunDirection);
      float lit = smoothstep(-0.25, 0.25, sunDot);

      vec3 color = base * (0.12 + 1.08 * lit);

      float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
      color += rimColor * fres * rimStrength * lit;

      float shadowZone = (1.0 - lit) * smoothstep(-0.3, -0.05, sunDot);
      color += earthshine * shadowZone * earthshineStrength;

      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), moonMat);
moonScene.add(moonMesh);

const moonHaloMat = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(0xd0dcf0) },
    intensity: { value: 0.35 }
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

const moonHalo = new THREE.Mesh(new THREE.SphereGeometry(1.06, 64, 64), moonHaloMat);
moonScene.add(moonHalo);

const moonAmbient = new THREE.AmbientLight(0x2a3a5a, 0.15);
moonScene.add(moonAmbient);

texLoader.load('textures/moon.jpg', (tex) => {
  tex.anisotropy = moonRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  moonUniforms.map.value = tex;
  console.log('[THREE] Луна загружена');
}, undefined, () => console.warn('[THREE] moon.jpg не найден'));

function resizeMoon() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  moonRenderer.setSize(w, h, false);
  moonCamera.aspect = w / h;
  moonCamera.updateProjectionMatrix();
}
resizeMoon();
window.addEventListener('resize', resizeMoon);

/* =========================================================
   ЛОГИКА ЛУНЫ
   До пика:  физически честный размер, плавный рост.
   Пик:      крупная, чуть выше центра.
   После:    художественный уход ВВЕРХ-ВПРАВО (к Солнцу),
             размер РАСТЁТ (эффект пролёта вплотную).
   ========================================================= */
function updateMoon(km, dt) {
  dt = dt || 0.016;

  if (typeof orbitMode !== 'undefined' && orbitMode) return;

  const appearKm = 80000;
  const vanishKm = 550000;

  if (km < appearKm || km > vanishKm) {
    moonCanvas.style.opacity = '0';
    return;
  }

  /* --- ПРОГРЕСС 0..1 --- */
  let progress;
  if (km < 384400) {
    progress = (km - appearKm) / (384400 - appearKm) * 0.5;
  } else {
    progress = 0.5 + (km - 384400) / (vanishKm - 384400) * 0.5;
  }

  /* --- ВИДИМОСТЬ --- */
  const fadeIn  = Math.min(1, (km - appearKm) / 30000);
  const fadeOut = Math.min(1, (vanishKm - km) / 30000);
  const visibility = Math.min(fadeIn, fadeOut);

  if (visibility <= 0.01) {
    moonCanvas.style.opacity = '0';
    return;
  }

  /* ============================================================
     РАЗМЕР
     До пика — физически честный: scale = R / d * K
     После пика — художественный рост для пролёта вплотную.
     ============================================================ */
  let scale;
  if (km <= 384400) {
    const rawDist = Math.abs(km - 384400);
    const distanceToMoon = Math.max(rawDist, MOON_MIN_DIST_KM);
    scale = (MOON_RADIUS_KM / distanceToMoon) * MOON_K;
  } else {
    const k = (km - 384400) / (vanishKm - 384400);   // 0..1
    const baseAtPeak = (MOON_RADIUS_KM / MOON_MIN_DIST_KM) * MOON_K;
    scale = baseAtPeak + k * 0.5;                    // 1.17 → 1.67
  }

  /* ============================================================
     ТРАЕКТОРИЯ
     До пика:  X ~ 0, Y ~ 0.3 (центр)
     После:    X растёт (вправо), Y растёт (вверх) — к Солнцу.
     ============================================================ */
  let xPos, yPos;
  if (km <= 384400) {
    const t = km / 384400;
    xPos = 0;
    yPos = 0.5 - t * 0.2;               // 0.5 → 0.3
  } else {
    const k = (km - 384400) / (vanishKm - 384400);
    xPos = k * k * 5.5;                 // вправо, ускоряясь
    yPos = 0.3 + k * k * 3.0 + k * 0.3; // вверх
  }

  moonCanvas.style.opacity = String(visibility);

  moonMesh.position.set(xPos, yPos, 0);
  moonMesh.scale.setScalar(scale);

  /* --- ВРАЩЕНИЕ (увеличено ×10 + лёгкое покачивание) ---
     Было 0.00015 → стало 0.0015 (в 10 раз быстрее).
     Плюс rotation.x для лёгкого покачивания. */
  moonMesh.rotation.y += 0.0015 * (dt / 0.016);
  moonMesh.rotation.x += 0.0003 * (dt / 0.016);

  moonHalo.position.copy(moonMesh.position);
  moonHalo.scale.setScalar(scale);

  moonCamera.lookAt(0, 0, 0);

  moonRenderer.render(moonScene, moonCamera);
}