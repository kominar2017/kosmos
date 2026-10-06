/* =========================================================
   URANUS 3D — Уран с кольцами + Титания и Оберон
   Pixel Ratio 1.5, сфера 48×48
   ========================================================= */

const URANUS_RADIUS_KM   = 25362;
const URANUS_MIN_DIST_KM = 10000;
const URANUS_K           = 3.2;

const URANUS_APPEAR_KM = 2722100000;
const URANUS_PEAK_KM   = 2723000000;
const URANUS_VANISH_KM = 2723900000;

const uranusCanvas = document.getElementById('uranus3d');
const uranusRenderer = new THREE.WebGLRenderer({ canvas: uranusCanvas, alpha: true, antialias: true });
uranusRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
uranusRenderer.setClearColor(0x000000, 0);
uranusRenderer.outputEncoding = THREE.sRGBEncoding;
uranusRenderer.toneMapping = THREE.ACESFilmicToneMapping;
uranusRenderer.toneMappingExposure = 0.85;

const uranusScene = new THREE.Scene();
const uranusCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
uranusCamera.position.set(0, 0, 3.2);
uranusCamera.lookAt(0, 0, 0);

const uranusSunDirection = new THREE.Vector3(0.7, 0.4, 0.5).normalize();

const uranusUniforms = {
  map:          { value: null },
  sunDirection: { value: uranusSunDirection.clone() },
  rimColor:     { value: new THREE.Color(0xa0e8f0) },
  earthshine:   { value: new THREE.Color(0x1a2a3a) },
  rimStrength:  { value: 0.55 },
  earthshineStrength: { value: 0.2 }
};

const uranusMat = new THREE.ShaderMaterial({
  uniforms: uranusUniforms,
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
      if (base.r + base.g + base.b < 0.01) base = vec3(0.65, 0.90, 0.95);
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

const uranusGroup = new THREE.Group();
uranusScene.add(uranusGroup);

const uranusMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), uranusMat);
uranusGroup.add(uranusMesh);

const URANUS_RING_INNER = 1.5;
const URANUS_RING_OUTER = 2.1;

const uRingGeo = new THREE.RingGeometry(URANUS_RING_INNER, URANUS_RING_OUTER, 96);

const uRingPos = uRingGeo.attributes.position;
const uRingUv = uRingGeo.attributes.uv;
const v3u = new THREE.Vector3();
for (let i = 0; i < uRingPos.count; i++) {
  v3u.fromBufferAttribute(uRingPos, i);
  const r = v3u.length();
  const u = (r - URANUS_RING_INNER) / (URANUS_RING_OUTER - URANUS_RING_INNER);
  uRingUv.setXY(i, u, 0.5);
}

const uRingMat = new THREE.MeshBasicMaterial({
  color: 0xa0b8c8, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.75
});

const uRingMesh = new THREE.Mesh(uRingGeo, uRingMat);

const uRingGroup = new THREE.Group();
uRingGroup.add(uRingMesh);
uRingGroup.rotation.x = Math.PI / 2;
uranusGroup.add(uRingGroup);

const titaniaMat = new THREE.MeshStandardMaterial({ color: 0x9a8a80, roughness: 0.95, metalness: 0.05 });
const oberonMat = new THREE.MeshStandardMaterial({ color: 0x6a5a50, roughness: 0.95, metalness: 0.05 });

const titaniaMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), titaniaMat);
const oberonMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), oberonMat);

uranusScene.add(titaniaMesh);
uranusScene.add(oberonMesh);

const uranusHaloMat = new THREE.ShaderMaterial({
  uniforms: { color: { value: new THREE.Color(0xa0d8e8) }, intensity: { value: 0.25 } },
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

const uranusHalo = new THREE.Mesh(new THREE.SphereGeometry(1.06, 32, 32), uranusHaloMat);
uranusGroup.add(uranusHalo);

uranusScene.add(new THREE.AmbientLight(0x1a2a3a, 0.4));
const uranusSunLight = new THREE.DirectionalLight(0xfff0e0, 1.0);
uranusSunLight.position.set(0.7, 0.4, 0.5);
uranusScene.add(uranusSunLight);

texLoader.load('textures/uranus.jpg', (tex) => {
  tex.anisotropy = uranusRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  uranusUniforms.map.value = tex;
  console.log('[THREE] Уран загружен');
}, undefined, () => console.warn('[THREE] uranus.jpg не найден'));

function resizeUranus() {
  const w = window.innerWidth, h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio, 1.5);
  uranusRenderer.setPixelRatio(dpr);
  uranusRenderer.setSize(w, h, false);
  uranusCamera.aspect = w / h;
  uranusCamera.updateProjectionMatrix();
}
resizeUranus();
window.addEventListener('resize', resizeUranus);

function updateUranus(km, dt) {
  dt = dt || 0.016;
  if (typeof orbitMode !== 'undefined' && orbitMode) return;
  if (km < URANUS_APPEAR_KM || km >= URANUS_VANISH_KM) {
    uranusCanvas.style.opacity = '0';
    return;
  }
  const fadeIn  = Math.min(1, (km - URANUS_APPEAR_KM) / ((URANUS_PEAK_KM - URANUS_APPEAR_KM) * 0.5));
  const fadeOut = Math.min(1, (URANUS_VANISH_KM - km) / ((URANUS_VANISH_KM - URANUS_PEAK_KM) * 0.5));
  const visibility = Math.min(fadeIn, fadeOut);
  if (visibility <= 0.01) { uranusCanvas.style.opacity = '0'; return; }

  let scale;
  if (km <= URANUS_PEAK_KM) {
    const rawDist = Math.abs(km - URANUS_PEAK_KM);
    const distanceToUranus = Math.max(rawDist, URANUS_MIN_DIST_KM);
    scale = (URANUS_RADIUS_KM / distanceToUranus) * URANUS_K;
  } else {
    const k = (km - URANUS_PEAK_KM) / (URANUS_VANISH_KM - URANUS_PEAK_KM);
    const baseAtPeak = (URANUS_RADIUS_KM / URANUS_MIN_DIST_KM) * URANUS_K;
    scale = baseAtPeak + k * 0.5;
  }

  let xPos, yPos;
  if (km <= URANUS_PEAK_KM) {
    const t = (km - URANUS_APPEAR_KM) / (URANUS_PEAK_KM - URANUS_APPEAR_KM);
    xPos = 0; yPos = 0.5 - t * 0.2;
  } else {
    const k = (km - URANUS_PEAK_KM) / (URANUS_VANISH_KM - URANUS_PEAK_KM);
    xPos = k * k * 5.5; yPos = 0.3 + k * k * 3.0 + k * 0.3;
  }

  uranusCanvas.style.opacity = String(visibility);
  uranusGroup.position.set(xPos, yPos, 0);
  uranusGroup.scale.setScalar(scale);
  uranusGroup.rotation.z = 1.7065;

  uranusMesh.rotation.y += 0.0008 * 1.4 * (dt / 0.016);
  uRingMesh.rotation.z += 0.0008 * (dt / 0.016);

  const titaniaAngle = globalTime * 0.15;
  const oberonAngle = globalTime * 0.1;

  titaniaMesh.position.set(
    xPos + Math.cos(titaniaAngle) * scale * 2.2,
    yPos + Math.sin(titaniaAngle) * scale * 2.2,
    -0.3
  );
  titaniaMesh.scale.setScalar(scale * 0.08);
  titaniaMesh.rotation.y += 0.002 * (dt / 0.016);

  oberonMesh.position.set(
    xPos + Math.cos(oberonAngle) * scale * 3.0,
    yPos + Math.sin(oberonAngle) * scale * 3.0,
    -0.4
  );
  oberonMesh.scale.setScalar(scale * 0.075);
  oberonMesh.rotation.y += 0.0018 * (dt / 0.016);

  uranusHalo.position.copy(uranusMesh.position);
  uranusHalo.scale.setScalar(scale);

  uranusCamera.position.set(0, scale * 0.4, Math.max(3.2, scale * 2.6));
  uranusCamera.lookAt(xPos * 0.3, yPos * 0.3, 0);
  uranusCamera.updateProjectionMatrix();

  uranusRenderer.render(uranusScene, uranusCamera);
}