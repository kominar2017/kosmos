/* =========================================================
   EARTH 3D — терминатор фиксирован, Солнце справа-вверху
   ========================================================= */

const EARTH_RADIUS_KM = 6371;
const EARTH_K = 3.2;

const earthCanvas = document.getElementById('earth3d');
const earthRenderer = new THREE.WebGLRenderer({ canvas: earthCanvas, alpha: true, antialias: true });
earthRenderer.setClearColor(0x000000, 0);
earthRenderer.outputEncoding = THREE.sRGBEncoding;
earthRenderer.toneMapping = THREE.ACESFilmicToneMapping;
earthRenderer.toneMappingExposure = 1.0;

const earthScene = new THREE.Scene();
const earthCamera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  20000
);
earthCamera.position.set(0, 0, 3.2);
earthCamera.lookAt(0, 0, 0);

/* === ЕДИНОЕ НАПРАВЛЕНИЕ СОЛНЦА === */
const SUN_DIR = new THREE.Vector3(0.95, 0.45, 0.1).normalize();

const earthUniforms = {
  dayTexture:   { value: null },
  nightTexture: { value: null },
  sunDirection: { value: SUN_DIR.clone() },
  hazeColor:    { value: new THREE.Color(0x6aaae8) },
  termColor:    { value: new THREE.Color(0xaad4ff) },
  termWidth:    { value: 0.15 },
  hazeStrength: { value: 0.08 },
  fresnelPower: { value: 3.5 },
  fresnelColor: { value: new THREE.Color(0x8fc4ff) },
  nightLights:  { value: 0.0 },
  time:         { value: 0.0 }
};

const earthMat = new THREE.ShaderMaterial({
  uniforms: earthUniforms,
  vertexShader: `
    varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewDir; varying vec3 vPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vPosition = worldPos.xyz;
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture; uniform sampler2D nightTexture;
    uniform vec3 sunDirection; uniform vec3 hazeColor; uniform vec3 termColor;
    uniform float termWidth; uniform float hazeStrength; uniform float fresnelPower;
    uniform vec3 fresnelColor; uniform float nightLights; uniform float time;
    varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewDir; varying vec3 vPosition;

    void main() {
      vec3 base = texture2D(dayTexture, vUv).rgb;
      if (base.r + base.g + base.b < 0.01) base = vec3(0.1, 0.35, 0.6);

      float sunDot = dot(vNormal, sunDirection);
      float lit = smoothstep(-0.05, 0.25, sunDot);

      float termDist = abs(sunDot);
      float terminator = 1.0 - smoothstep(0.0, termWidth, termDist);
      terminator = pow(terminator, 2.0) * 0.6;

      vec3 dayColor = base * (0.65 + 0.65 * lit);
      vec3 nightBase = base * 0.06 + vec3(0.005, 0.008, 0.02);

      vec3 cityRaw = texture2D(nightTexture, vUv).rgb;
      vec2 texel = vec2(1.0 / 2048.0, 1.0 / 1024.0);
      vec3 glow = vec3(0.0);
      glow += texture2D(nightTexture, vUv).rgb * 1.0;
      glow += texture2D(nightTexture, vUv + vec2( texel.x * 2.0, 0.0)).rgb * 0.7;
      glow += texture2D(nightTexture, vUv + vec2(-texel.x * 2.0, 0.0)).rgb * 0.7;
      glow += texture2D(nightTexture, vUv + vec2( 0.0,  texel.y * 2.0)).rgb * 0.7;
      glow += texture2D(nightTexture, vUv + vec2( 0.0, -texel.y * 2.0)).rgb * 0.7;
      glow += texture2D(nightTexture, vUv + vec2( texel.x * 4.0,  texel.y * 4.0)).rgb * 0.4;
      glow += texture2D(nightTexture, vUv + vec2(-texel.x * 4.0, -texel.y * 4.0)).rgb * 0.4;
      glow += texture2D(nightTexture, vUv + vec2( texel.x * 4.0, -texel.y * 4.0)).rgb * 0.4;
      glow += texture2D(nightTexture, vUv + vec2(-texel.x * 4.0,  texel.y * 4.0)).rgb * 0.4;
      glow /= 5.4;

      vec3 cityCenters = cityRaw * cityRaw * 4.0;
      vec3 cityFinal = glow * 1.1 + cityCenters * 0.7;
      cityFinal *= vec3(1.2, 0.95, 0.6);

      float nightMask = 1.0 - smoothstep(-0.05, 0.15, sunDot);
      nightBase += cityFinal * nightMask * nightLights;

      vec3 color = mix(nightBase, dayColor, lit);
      color = mix(color, hazeColor, hazeStrength);
      float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), fresnelPower);
      color += fresnelColor * fres * 0.35 * lit;
      color += termColor * terminator;
      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), earthMat);
earthScene.add(earthMesh);

/* ---------- Облака ---------- */
const cloudUniforms = {
  sunDirection: { value: SUN_DIR.clone() },
  time:         { value: 0.0 },
  opacity:      { value: 0.70 }
};

const cloudMat = new THREE.ShaderMaterial({
  uniforms: cloudUniforms,
  vertexShader: `
    varying vec3 vNormal; varying vec3 vViewDir; varying vec3 vModelPos;
    void main() {
      vModelPos = normalize(position);
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform vec3 sunDirection; uniform float time; uniform float opacity;
    varying vec3 vNormal; varying vec3 vViewDir; varying vec3 vModelPos;

    float hash31(vec3 p) {
      p = fract(p * vec3(0.1031, 0.1030, 0.0973));
      p += dot(p, p.yzx + 33.33);
      return fract((p.x + p.y) * p.z);
    }
    float noise3(vec3 p) {
      vec3 i = floor(p); vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float n000 = hash31(i + vec3(0,0,0));
      float n100 = hash31(i + vec3(1,0,0));
      float n010 = hash31(i + vec3(0,1,0));
      float n110 = hash31(i + vec3(1,1,0));
      float n001 = hash31(i + vec3(0,0,1));
      float n101 = hash31(i + vec3(1,0,1));
      float n011 = hash31(i + vec3(0,1,1));
      float n111 = hash31(i + vec3(1,1,1));
      float nx00 = mix(n000, n100, f.x);
      float nx10 = mix(n010, n110, f.x);
      float nx01 = mix(n001, n101, f.x);
      float nx11 = mix(n011, n111, f.x);
      return mix(mix(nx00, nx10, f.y), mix(nx01, nx11, f.y), f.z);
    }
    float fbm3(vec3 p) {
      float v = 0.0; float a = 0.5;
      for (int i = 0; i < 6; i++) { v += a * noise3(p); p *= 2.02; a *= 0.5; }
      return v;
    }

    void main() {
      vec3 p = vModelPos + vec3(time * 0.005, 0.0, time * 0.003);
      float c1 = fbm3(p * 2.2);
      float c2 = fbm3(p * 5.5);
      float c3 = fbm3(p * 12.0);
      float clouds = c1 * 0.55 + c2 * 0.30 + c3 * 0.15;
      clouds = smoothstep(0.40, 0.78, clouds);
      float lat = abs(vModelPos.y);
      clouds *= 1.0 - smoothstep(0.8, 1.0, lat) * 0.55;
      vec3 worldNormal = normalize(vNormal);
      float sunDot = dot(worldNormal, sunDirection);
      float lit = smoothstep(-0.15, 0.25, sunDot);
      vec3 cloudCol = mix(vec3(0.55, 0.6, 0.72), vec3(1.0, 0.98, 0.95), lit);
      float a = clouds * opacity * 0.72 * (0.15 + 0.85 * lit);
      gl_FragColor = vec4(cloudCol, a);
    }
  `,
  transparent: true,
  depthWrite: false
});

const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(1.012, 128, 128), cloudMat);
earthScene.add(cloudMesh);

/* ---------- Атмосфера ---------- */
function makeAtmoMat(color, intensity, power) {
  return new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(color) }, intensity: { value: intensity } },
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
        float rim = pow(1.0 - abs(facing), ${power});
        gl_FragColor = vec4(color, rim * intensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  });
}

const atmoInnerMat = makeAtmoMat(0x9ad2ff, 0.75, '4.0');
const atmoOuterMat = makeAtmoMat(0x5aa0f0, 0.25, '2.5');

const atmoInner = new THREE.Mesh(new THREE.SphereGeometry(1.025, 64, 64), atmoInnerMat);
const atmoOuter = new THREE.Mesh(new THREE.SphereGeometry(1.12, 64, 64), atmoOuterMat);
earthScene.add(atmoInner, atmoOuter);

/* ---------- Текстуры ---------- */
texLoader.load('textures/earth.jpg', (tex) => {
  tex.anisotropy = earthRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  earthUniforms.dayTexture.value = tex;
  console.log('[THREE] Земля (день) загружена');
}, undefined, () => console.warn('[THREE] earth.jpg не найден'));

texLoader.load('textures/night.jpg', (tex) => {
  tex.anisotropy = earthRenderer.capabilities.getMaxAnisotropy();
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  earthUniforms.nightTexture.value = tex;
  console.log('[THREE] Земля (ночь) загружена');
}, undefined, () => console.warn('[THREE] night.jpg не найден'));

/* =========================================================
   ЛОГИКА ЗЕМЛИ
   ========================================================= */
function updateEarth(km, dt) {
  dt = dt || 0.016;

  const nowAspect = window.innerWidth / window.innerHeight;
  if (Math.abs(earthCamera.aspect - nowAspect) > 0.001) {
    earthCamera.aspect = nowAspect;
    earthRenderer.setSize(window.innerWidth, window.innerHeight, false);
    earthCamera.updateProjectionMatrix();
  }

  if (typeof orbitMode !== 'undefined' && orbitMode) return;

  if (km < 100 || km > 384400) {
    earthCanvas.style.opacity = '0';
    return;
  }

  const kmSafe = Math.max(km, EARTH_RADIUS_KM * 0.01);
  let scale = (EARTH_RADIUS_KM / kmSafe) * EARTH_K;

  const t = Math.min(1, km / 384400);
  const yPos = -0.5 - t * 1.5;

  earthMesh.scale.setScalar(scale);
  earthMesh.position.set(0, yPos, 0);
  earthMesh.rotation.y += 0.0008 * (dt / 0.016);
  earthMesh.rotation.z = 0.41;

  cloudMesh.scale.setScalar(scale);
  cloudMesh.position.set(0, yPos, 0);
  cloudMesh.rotation.y += 0.0012 * (dt / 0.016);
  cloudMesh.rotation.z = 0.41;
  cloudUniforms.sunDirection.value.copy(SUN_DIR);
  cloudUniforms.time.value = globalTime;

  /* === СОЛНЦЕ ФИКСИРОВАНО — терминатор не крутится === */
  earthUniforms.sunDirection.value.copy(SUN_DIR);

  const lightsAmount = Math.min(1, Math.max(0, (km - 500) / 1000));
  earthUniforms.nightLights.value = lightsAmount;
  earthUniforms.time.value = globalTime;

  atmoInner.scale.setScalar(scale);
  atmoInner.position.set(0, yPos, 0);
  atmoInner.rotation.z = 0.41;
  atmoInnerMat.uniforms.intensity.value = 0.75;

  atmoOuter.scale.setScalar(scale);
  atmoOuter.position.set(0, yPos, 0);
  atmoOuter.rotation.z = 0.41;
  atmoOuterMat.uniforms.intensity.value = 0.25;

  const cloudFade = Math.max(0, 1 - km / 60000);
  cloudUniforms.opacity.value = 0.70 * cloudFade;

  earthMesh.visible = true;
  cloudMesh.visible = cloudFade > 0.02;
  atmoInner.visible = true;
  atmoOuter.visible = true;

  earthCanvas.style.opacity = '1';
  earthRenderer.render(earthScene, earthCamera);
}

/* =========================================================
   ЖЁСТКИЙ РЕСАЙЗ
   ========================================================= */
function resizeEarth() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.max(1, window.devicePixelRatio);

  earthCanvas.width = Math.round(w * dpr);
  earthCanvas.height = Math.round(h * dpr);
  earthCanvas.style.width = w + 'px';
  earthCanvas.style.height = h + 'px';

  earthRenderer.setPixelRatio(dpr);
  earthRenderer.setSize(w, h, false);
  earthCamera.aspect = w / h;
  earthCamera.updateProjectionMatrix();
}

resizeEarth();
window.addEventListener('resize', resizeEarth);
window.addEventListener('orientationchange', resizeEarth);

window.addEventListener('load', () => {
  resizeEarth();
  setTimeout(resizeEarth, 50);
  setTimeout(resizeEarth, 150);
  setTimeout(resizeEarth, 500);
  setTimeout(resizeEarth, 1500);
});