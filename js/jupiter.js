/* =========================================================
   JUPITER 3D — Юпитер + 4 галилеевых луны с текстурами
   Pixel Ratio 1.5, сфера 64×64
   ========================================================= */

const JUPITER_RADIUS_KM   = 69911;
const JUPITER_MIN_DIST_KM = 8000;
const JUPITER_K           = 3.2;

const JUPITER_APPEAR_KM = 627220000;
const JUPITER_PEAK_KM   = 628000000;
const JUPITER_VANISH_KM = 628780000;

const jupiterCanvas = document.getElementById('jupiter3d');
const jupiterRenderer = new THREE.WebGLRenderer({ canvas: jupiterCanvas, alpha: true, antialias: true });
jupiterRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
jupiterRenderer.setClearColor(0x000000, 0);
jupiterRenderer.outputEncoding = THREE.sRGBEncoding;
jupiterRenderer.toneMapping = THREE.ACESFilmicToneMapping;
jupiterRenderer.toneMappingExposure = 0.85;

const jupiterScene = new THREE.Scene();
const jupiterCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
jupiterCamera.position.set(0, 0, 3.2);
jupiterCamera.lookAt(0, 0, 0);

const jupiterSunDirection = new THREE.Vector3(0.7, 0.4, 0.5).normalize();

const jupiterUniforms = {
  map:          { value: null },
  sunDirection: { value: jupiterSunDirection.clone() },
  rimColor:     { value: new THREE.Color(0xffd8a0) },
  earthshine:   { value: new THREE.Color(0x3a2a1a) },
  rimStrength:  { value: 0.5 },
  earthshineStrength: { value: 0.2 }
};

const jupiterMat = new THREE.ShaderMaterial({
  uniforms: jupiterUniforms,
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
      if (base.r + base.g + base.b < 0.01) base = vec3(0.85, 0.72, 0.55);
      float sunDot = dot(vNormal, sunDirection);
      float lit = smoothstep(-0.35, 0.35, sunDot);
      vec3 color = base * (0.10 + 0.75 * lit);
      float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
      color += rimColor * fres * rimStrength * lit;
      float shadowZone = (1.0 - lit) * smoothstep(-0.3, -0.05, sunDot);
      color += earthshine * shadowZone * earthshineStrength;
      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const jupiterMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), jupiterMat);
jupiterScene.add(jupiterMesh);

const GALILEAN_MOONS = [
  { name: 'Ио',      size: 0.08, orbit: 1.6, speed: 0.25, color: 0xffcc44, texture: 'io.jpg',       angle: 0.0 },
  { name: 'Европа',  size: 0.07, orbit: 2.1, speed: 0.18, color: 0xe8f0ff, texture: 'europa.jpg',   angle: 1.5 },
  { name: 'Ганимед', size: 0.12, orbit: 2.7, speed: 0.12, color: 0x9a8878, texture: 'ganymede.jpg', angle: 3.0 },
  { name: 'Каллисто',size: 0.10, orbit: 3.4, speed: 0.08, color: 0x5a4a3a, texture: 'callisto.jpg', angle: 4.5 }
];

const galileanMeshes = [];

GALILEAN_MOONS.forEach((m) => {
  const geo = new THREE.SphereGeometry(1, 24, 24);
  const mat = new THREE.MeshStandardMaterial({
    color: m.color,
    roughness: 0.9,
    metalness: 0.02,
    emissive: 0x000000,
    emissiveIntensity: 0,
    map: null
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.setScalar(m.size);
  jupiterScene.add(mesh);

  texLoader.load('textures/' + m.texture, (tex) => {
    tex.anisotropy = jupiterRenderer.capabilities.getMaxAnisotropy();
    tex.encoding = THREE.sRGBEncoding;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    mat.map = tex;
    mat.color.set(0xffffff);
    mat.needsUpdate = true;
    console.log('[THREE] Луна Юпитера загружена:', m.name);
  }, undefined, () => console.warn('[THREE] Текстура не найдена:', m.texture));

  galileanMeshes.push({ mesh, moon: m, angle: m.angle });
});

const jupiterHaloMat = new THREE.ShaderMaterial({
  uniforms: { color: { value: new THREE.Color(0xffd0a0) }, intensity: { value: 0.3 } },
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

const jupiterHalo = new THREE.Mesh(new THREE.SphereGeometry(1.06, 32, 32), jupiterHaloMat);
jupiterScene.add(jupiterHalo);

jupiterScene.add(new THREE.AmbientLight(0x3a2a1a, 0.4));
const jupiterSunLight = new THREE.DirectionalLight(0xfff0e0, 1.2);
jupiterSunLight.position.set(0.7, 0.4, 0.5);
jupiterScene.add(jupiterSunLight);

texLoader.load('textures/jupiter.jpg', (tex) => {
  tex.anisotropy = jupiterRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  jupiterUniforms.map.value = tex;
  console.log('[THREE] Юпитер загружен');
}, undefined, () => console.warn('[THREE] jupiter.jpg не найден'));

function resizeJupiter() {
  const w = window.innerWidth, h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio, 1.5);
  jupiterRenderer.setPixelRatio(dpr);
  jupiterRenderer.setSize(w, h, false);
  jupiterCamera.aspect = w / h;
  jupiterCamera.updateProjectionMatrix();
}
resizeJupiter();
window.addEventListener('resize', resizeJupiter);

function updateJupiter(km, dt) {
  dt = dt || 0.016;
  if (typeof orbitMode !== 'undefined' && orbitMode) return;
  if (km < JUPITER_APPEAR_KM || km >= JUPITER_VANISH_KM) {
    jupiterCanvas.style.opacity = '0';
    return;
  }
  const fadeIn  = Math.min(1, (km - JUPITER_APPEAR_KM) / ((JUPITER_PEAK_KM - JUPITER_APPEAR_KM) * 0.5));
  const fadeOut = Math.min(1, (JUPITER_VANISH_KM - km) / ((JUPITER_VANISH_KM - JUPITER_PEAK_KM) * 0.5));
  const visibility = Math.min(fadeIn, fadeOut);
  if (visibility <= 0.01) { jupiterCanvas.style.opacity = '0'; return; }

  let scale;
  if (km <= JUPITER_PEAK_KM) {
    const rawDist = Math.abs(km - JUPITER_PEAK_KM);
    const distanceToJupiter = Math.max(rawDist, JUPITER_MIN_DIST_KM);
    scale = (JUPITER_RADIUS_KM / distanceToJupiter) * JUPITER_K;
  } else {
    const k = (km - JUPITER_PEAK_KM) / (JUPITER_VANISH_KM - JUPITER_PEAK_KM);
    const baseAtPeak = (JUPITER_RADIUS_KM / JUPITER_MIN_DIST_KM) * JUPITER_K;
    scale = baseAtPeak + k * 0.5;
  }

  let xPos, yPos;
  if (km <= JUPITER_PEAK_KM) {
    const t = (km - JUPITER_APPEAR_KM) / (JUPITER_PEAK_KM - JUPITER_APPEAR_KM);
    xPos = 0; yPos = 0.5 - t * 0.2;
  } else {
    const k = (km - JUPITER_PEAK_KM) / (JUPITER_VANISH_KM - JUPITER_PEAK_KM);
    xPos = k * k * 5.5; yPos = 0.3 + k * k * 3.0 + k * 0.3;
  }

  jupiterCanvas.style.opacity = String(visibility);
  jupiterMesh.position.set(xPos, yPos, 0);
  jupiterMesh.scale.setScalar(scale);
  jupiterMesh.rotation.y += 0.0008 * 2.4 * (dt / 0.016);
  jupiterMesh.rotation.z = 0.0546;

  galileanMeshes.forEach((g) => {
    g.angle += g.moon.speed * dt;
    const orbitR = g.moon.orbit * scale;
    g.mesh.position.set(
      xPos + Math.cos(g.angle) * orbitR,
      yPos + Math.sin(g.angle) * orbitR * 0.3,
      -0.2 + Math.sin(g.angle) * 0.1
    );
    g.mesh.scale.setScalar(g.moon.size * scale);
    g.mesh.rotation.y += 0.001 * (dt / 0.016);
  });

  jupiterHalo.position.copy(jupiterMesh.position);
  jupiterHalo.scale.setScalar(scale);

  jupiterCamera.position.set(0, 0, Math.max(3.2, scale * 2.5));
  jupiterCamera.lookAt(xPos * 0.3, yPos * 0.3, 0);
  jupiterCamera.updateProjectionMatrix();

  jupiterRenderer.render(jupiterScene, jupiterCamera);
}