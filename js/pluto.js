/* =========================================================
   PLUTO 3D — Плутон + Харон
   ========================================================= */

const PLUTO_RADIUS_KM   = 1188;
const PLUTO_MIN_DIST_KM = 5000;
const PLUTO_K           = 3.2;

const PLUTO_APPEAR_KM = 5905610000;
const PLUTO_PEAK_KM   = 5906000000;
const PLUTO_VANISH_KM = 5906390000;

const plutoCanvas = document.getElementById('pluto3d');
const plutoRenderer = new THREE.WebGLRenderer({ canvas: plutoCanvas, alpha: true, antialias: true });
plutoRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
plutoRenderer.setClearColor(0x000000, 0);
plutoRenderer.outputEncoding = THREE.sRGBEncoding;
plutoRenderer.toneMapping = THREE.ACESFilmicToneMapping;
plutoRenderer.toneMappingExposure = 1.0;

const plutoScene = new THREE.Scene();
const plutoCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
plutoCamera.position.set(0, 0, 3.2);
plutoCamera.lookAt(0, 0, 0);

const plutoSunDirection = new THREE.Vector3(0.7, 0.4, 0.5).normalize();

const plutoUniforms = {
  map:          { value: null },
  sunDirection: { value: plutoSunDirection.clone() },
  rimColor:     { value: new THREE.Color(0xc8b0a0) },
  earthshine:   { value: new THREE.Color(0x2a1a1a) },
  rimStrength:  { value: 0.5 },
  earthshineStrength: { value: 0.2 }
};

const plutoMat = new THREE.ShaderMaterial({
  uniforms: plutoUniforms,
  side: THREE.DoubleSide,
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
      if (base.r + base.g + base.b < 0.01) base = vec3(0.75, 0.65, 0.55);
      float sunDot = dot(vNormal, sunDirection);
      float lit = smoothstep(-0.35, 0.35, sunDot);
      vec3 color = base * (0.10 + 0.95 * lit);
      float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
      color += rimColor * fres * rimStrength * lit;
      float shadowZone = (1.0 - lit) * smoothstep(-0.3, -0.05, sunDot);
      color += earthshine * shadowZone * earthshineStrength;
      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const plutoGroup = new THREE.Group();
plutoScene.add(plutoGroup);

const plutoMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), plutoMat);
plutoGroup.add(plutoMesh);

const charonMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.05, map: null });
const charonMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), charonMat);
plutoScene.add(charonMesh);

const plutoHaloMat = new THREE.ShaderMaterial({
  uniforms: { color: { value: new THREE.Color(0xc8b8a8) }, intensity: { value: 0.3 } },
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

const plutoHalo = new THREE.Mesh(new THREE.SphereGeometry(1.06, 64, 64), plutoHaloMat);
plutoGroup.add(plutoHalo);

plutoScene.add(new THREE.AmbientLight(0x3a2a1a, 0.4));
const plutoSunLight = new THREE.DirectionalLight(0xfff0e0, 1.0);
plutoSunLight.position.set(0.7, 0.4, 0.5);
plutoScene.add(plutoSunLight);

texLoader.load('textures/pluto.jpg', (tex) => {
  tex.anisotropy = plutoRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  plutoUniforms.map.value = tex;
  console.log('[THREE] Плутон загружен');
}, undefined, () => console.warn('[THREE] pluto.jpg не найден'));

texLoader.load('textures/charon.jfif', (tex) => {
  tex.anisotropy = plutoRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  charonMat.map = tex;
  charonMat.color.set(0xffffff);
  charonMat.needsUpdate = true;
  console.log('[THREE] Харон загружен');
}, undefined, () => console.warn('[THREE] charon.jfif не найден'));

function resizePluto() {
  const w = window.innerWidth, h = window.innerHeight;
  plutoRenderer.setSize(w, h, false);
  plutoCamera.aspect = w / h;
  plutoCamera.updateProjectionMatrix();
}
resizePluto();
window.addEventListener('resize', resizePluto);

function updatePluto(km, dt) {
  dt = dt || 0.016;
  if (typeof orbitMode !== 'undefined' && orbitMode) return;
  if (km < PLUTO_APPEAR_KM || km >= PLUTO_VANISH_KM) {
    plutoCanvas.style.opacity = '0';
    return;
  }
  const fadeIn  = Math.min(1, (km - PLUTO_APPEAR_KM) / ((PLUTO_PEAK_KM - PLUTO_APPEAR_KM) * 0.5));
  const fadeOut = Math.min(1, (PLUTO_VANISH_KM - km) / ((PLUTO_VANISH_KM - PLUTO_PEAK_KM) * 0.5));
  const visibility = Math.min(fadeIn, fadeOut);
  if (visibility <= 0.01) { plutoCanvas.style.opacity = '0'; return; }

  let scale;
  if (km <= PLUTO_PEAK_KM) {
    const rawDist = Math.abs(km - PLUTO_PEAK_KM);
    const distanceToPluto = Math.max(rawDist, PLUTO_MIN_DIST_KM);
    scale = (PLUTO_RADIUS_KM / distanceToPluto) * PLUTO_K;
  } else {
    const k = (km - PLUTO_PEAK_KM) / (PLUTO_VANISH_KM - PLUTO_PEAK_KM);
    const baseAtPeak = (PLUTO_RADIUS_KM / PLUTO_MIN_DIST_KM) * PLUTO_K;
    scale = baseAtPeak + k * 0.5;
  }

  let xPos, yPos;
  if (km <= PLUTO_PEAK_KM) {
    const t = (km - PLUTO_APPEAR_KM) / (PLUTO_PEAK_KM - PLUTO_APPEAR_KM);
    xPos = 0; yPos = 0.5 - t * 0.2;
  } else {
    const k = (km - PLUTO_PEAK_KM) / (PLUTO_VANISH_KM - PLUTO_PEAK_KM);
    xPos = k * k * 5.5; yPos = 0.3 + k * k * 3.0 + k * 0.3;
  }

  plutoCanvas.style.opacity = String(visibility);
  plutoGroup.position.set(xPos, yPos, 0);
  plutoGroup.scale.setScalar(scale);
  plutoGroup.rotation.z = 2.138;

  plutoMesh.rotation.y += 0.0002 * (dt / 0.016);

  const charonAngle = globalTime * 0.08;
  charonMesh.position.set(
    xPos + Math.cos(charonAngle) * scale * 3.0,
    yPos + Math.sin(charonAngle) * scale * 3.0,
    -0.3
  );
  charonMesh.scale.setScalar(scale * 0.5);
  charonMesh.rotation.y += 0.0005 * (dt / 0.016);

  plutoHalo.position.copy(plutoMesh.position);
  plutoHalo.scale.setScalar(scale);

  plutoCamera.position.set(0, scale * 0.4, Math.max(3.2, scale * 2.6));
  plutoCamera.lookAt(xPos * 0.3, yPos * 0.3, 0);
  plutoCamera.updateProjectionMatrix();

  plutoRenderer.render(plutoScene, plutoCamera);
}