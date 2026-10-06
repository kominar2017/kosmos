/* =========================================================
   ORBIT — режим обзора
   DPR 1.5 для всех планетных рендереров
   ========================================================= */

let orbitMode = false;
let orbitTarget = 'earth';
let orbitAngleX = 0.3;
let orbitAngleY = 0;
let orbitZoom = 3.2;
let orbitDragging = false;
let orbitLastX = 0;
let orbitLastY = 0;
let orbitDropdownOpen = false;

const orbitBtn = document.getElementById('orbitBtn');
let orbitUI = null;

const ORBIT_OBJECT_LIST = [
  { key: 'earth',   i18n: 'orbitEarth' },
  { key: 'moon',    i18n: 'orbitMoon' },
  { key: 'mars',    i18n: 'orbitMars' },
  { key: 'jupiter', i18n: 'orbitJupiter' },
  { key: 'saturn',  i18n: 'orbitSaturn' },
  { key: 'uranus',  i18n: 'orbitUranus' },
  { key: 'neptune', i18n: 'orbitNeptune' },
  { key: 'pluto',   i18n: 'orbitPluto' },
  { key: 'iss',     i18n: 'orbitISS' },
  { key: 'voyager', i18n: 'orbitVoyager' }
];

/* ---------- Применяем DPR 1.5 ко всем планетным рендерерам ---------- */
function applyOrbitDPR() {
  const dpr = Math.min(window.devicePixelRatio, 1.5);

  const planetRenderers = [
    earthRenderer, moonRenderer, marsRenderer, jupiterRenderer,
    saturnRenderer, uranusRenderer, neptuneRenderer, plutoRenderer,
    issRenderer, voyagerRenderer
  ];

  for (const r of planetRenderers) {
    if (r && typeof r.setPixelRatio === 'function') {
      r.setPixelRatio(dpr);
    }
  }

  /* Пояса оставляем на DPR 1 — оптимизация */
  if (typeof asteroidsRenderer !== 'undefined' && asteroidsRenderer) {
    asteroidsRenderer.setPixelRatio(1);
  }
  if (typeof kuiperRenderer !== 'undefined' && kuiperRenderer) {
    kuiperRenderer.setPixelRatio(1);
  }
}

function getOrbitObject(target) {
  switch (target) {
    case 'earth':
      return { camera: earthCamera, renderer: earthRenderer, scene: earthScene,
        canvas: earthCanvas, mesh: earthMesh, halo: null, group: null,
        extra: [cloudMesh, atmoInner, atmoOuter], tilt: 0 };
    case 'moon':
      return { camera: moonCamera, renderer: moonRenderer, scene: moonScene,
        canvas: moonCanvas, mesh: moonMesh, halo: moonHalo, group: null,
        extra: [], tilt: 0 };
    case 'mars':
      return { camera: marsCamera, renderer: marsRenderer, scene: marsScene,
        canvas: marsCanvas, mesh: marsMesh, halo: marsHalo, group: null,
        extra: [phobosMesh, deimosMesh], tilt: 0.44 };
    case 'jupiter':
      return { camera: jupiterCamera, renderer: jupiterRenderer, scene: jupiterScene,
        canvas: jupiterCanvas, mesh: jupiterMesh, halo: jupiterHalo, group: null,
        extra: galileanMeshes.map(g => g.mesh), tilt: 0.0546 };
    case 'saturn':
      return { camera: saturnCamera, renderer: saturnRenderer, scene: saturnScene,
        canvas: saturnCanvas, mesh: saturnMesh, halo: saturnHalo, group: saturnGroup,
        extra: [ringMesh, titanMesh], tilt: 0.466 };
    case 'uranus':
      return { camera: uranusCamera, renderer: uranusRenderer, scene: uranusScene,
        canvas: uranusCanvas, mesh: uranusMesh, halo: uranusHalo, group: uranusGroup,
        extra: [uRingMesh, titaniaMesh, oberonMesh], tilt: 1.7065 };
    case 'neptune':
      return { camera: neptuneCamera, renderer: neptuneRenderer, scene: neptuneScene,
        canvas: neptuneCanvas, mesh: neptuneMesh, halo: neptuneHalo, group: neptuneGroup,
        extra: [nRingMesh, tritonMesh], tilt: 0.4943 };
    case 'pluto':
      return { camera: plutoCamera, renderer: plutoRenderer, scene: plutoScene,
        canvas: plutoCanvas, mesh: plutoMesh, halo: plutoHalo, group: plutoGroup,
        extra: [charonMesh], tilt: 2.138 };
    case 'iss':
      return (typeof issMesh !== 'undefined' && issMesh) ? {
        camera: issCamera, renderer: issRenderer, scene: issScene,
        canvas: issCanvas, mesh: issMesh, halo: null, group: null,
        extra: [], tilt: 0
      } : null;
    case 'voyager':
      return (typeof voyagerMesh !== 'undefined' && voyagerMesh) ? {
        camera: voyagerCamera, renderer: voyagerRenderer, scene: voyagerScene,
        canvas: voyagerCanvas, mesh: voyagerMesh, halo: null, group: null,
        extra: [], tilt: 0
      } : null;
    default: return null;
  }
}

function buildOrbitUI() {
  orbitUI = document.createElement('div');
  orbitUI.id = 'orbitUI';
  document.body.appendChild(orbitUI);

  const top = document.createElement('div');
  top.className = 'orbit-top';
  top.innerHTML = `
    <div class="orbit-dropdown" id="orbitDropdown">
      <button class="orbit-dropdown-toggle" id="orbitDropdownToggle">
        <span class="orbit-dropdown-label" id="orbitDropdownLabel">${t('orbitSelect')}</span>
        <span class="orbit-dropdown-arrow">▾</span>
      </button>
      <div class="orbit-dropdown-menu" id="orbitDropdownMenu"></div>
    </div>
  `;
  orbitUI.appendChild(top);

  const menu = top.querySelector('#orbitDropdownMenu');
  for (const obj of ORBIT_OBJECT_LIST) {
    const item = document.createElement('button');
    item.className = 'orbit-dropdown-item';
    item.dataset.target = obj.key;
    item.textContent = t(obj.i18n);
    if (obj.key === 'iss' && !(typeof issLoaded !== 'undefined' && issLoaded)) item.classList.add('loading');
    if (obj.key === 'voyager' && !(typeof voyagerLoaded !== 'undefined' && voyagerLoaded)) item.classList.add('loading');
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      if (item.classList.contains('loading')) return;
      selectOrbitTarget(obj.key, obj.i18n);
      closeDropdown();
    });
    menu.appendChild(item);
  }

  top.querySelector('#orbitDropdownToggle').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener('click', (e) => {
    if (!orbitDropdownOpen) return;
    if (e.target.closest('#orbitDropdown')) return;
    closeDropdown();
  });

  const bottom = document.createElement('div');
  bottom.className = 'orbit-bottom';
  bottom.innerHTML = `
    <div class="orbit-hint" id="orbitHint">${t('orbitHint')}</div>
    <button class="orbit-close" id="orbitClose">${t('orbitBack')}</button>
  `;
  orbitUI.appendChild(bottom);

  document.getElementById('orbitClose').addEventListener('click', (e) => {
    e.stopPropagation();
    exitOrbit();
  });

  selectOrbitTarget('earth', 'orbitEarth', true);
}

function toggleDropdown() {
  orbitDropdownOpen = !orbitDropdownOpen;
  const dd = document.getElementById('orbitDropdown');
  if (dd) dd.classList.toggle('open', orbitDropdownOpen);
}
function closeDropdown() {
  orbitDropdownOpen = false;
  const dd = document.getElementById('orbitDropdown');
  if (dd) dd.classList.remove('open');
}
function selectOrbitTarget(key, i18nKey) {
  orbitTarget = key;
  orbitAngleX = 0.3;
  orbitAngleY = 0;
  orbitZoom = 3.2;
  const label = document.getElementById('orbitDropdownLabel');
  if (label && i18nKey) label.textContent = t(i18nKey);
  document.querySelectorAll('.orbit-dropdown-item').forEach(it => {
    it.classList.toggle('active', it.dataset.target === key);
  });
}
function updateOrbitLabels() {
  if (!orbitUI) return;
  const label = document.getElementById('orbitDropdownLabel');
  const hint = document.getElementById('orbitHint');
  const close = document.getElementById('orbitClose');
  const active = ORBIT_OBJECT_LIST.find(o => o.key === orbitTarget);
  if (label && active) label.textContent = t(active.i18n);
  if (hint) hint.textContent = t('orbitHint');
  if (close) close.textContent = t('orbitBack');
  document.querySelectorAll('.orbit-dropdown-item').forEach(it => {
    const obj = ORBIT_OBJECT_LIST.find(o => o.key === it.dataset.target);
    if (obj && !it.classList.contains('loading')) it.textContent = t(obj.i18n);
  });
}

function notifyISSLoaded() {
  const item = document.querySelector('.orbit-dropdown-item[data-target="iss"]');
  if (item) { item.classList.remove('loading'); item.textContent = t('orbitISS'); }
}
function notifyISSFailed() {
  const item = document.querySelector('.orbit-dropdown-item[data-target="iss"]');
  if (item) { item.classList.remove('loading'); item.classList.add('disabled'); item.textContent = t('orbitISS') + ' (—)'; }
}
function notifyVoyagerLoaded() {
  const item = document.querySelector('.orbit-dropdown-item[data-target="voyager"]');
  if (item) { item.classList.remove('loading'); item.textContent = t('orbitVoyager'); console.log('[ORBIT] Вояджер готов к выбору'); }
}
function notifyVoyagerFailed() {
  const item = document.querySelector('.orbit-dropdown-item[data-target="voyager"]');
  if (item) { item.classList.remove('loading'); item.classList.add('disabled'); item.textContent = t('orbitVoyager') + ' (—)'; }
}

function enterOrbit() {
  orbitMode = true;
  orbitBtn.style.display = 'none';
  document.getElementById('reviewBtn').style.display = 'none';

  /* Применяем DPR 1.5 ко всем рендерерам */
  applyOrbitDPR();

  if (!orbitUI) {
    buildOrbitUI();
    window.addEventListener('keydown', (e) => { if (e.code === 'Escape' && orbitMode) exitOrbit(); });
    window.addEventListener('mousedown', (e) => {
      if (!orbitMode) return;
      if (e.target.closest('#orbitUI')) return;
      orbitDragging = true;
      orbitLastX = e.clientX;
      orbitLastY = e.clientY;
    });
    window.addEventListener('mousemove', (e) => {
      if (!orbitMode || !orbitDragging) return;
      const dx = e.clientX - orbitLastX;
      const dy = e.clientY - orbitLastY;
      orbitLastX = e.clientX;
      orbitLastY = e.clientY;
      orbitAngleY += dx * 0.005;
      orbitAngleX += dy * 0.005;
      orbitAngleX = Math.max(-1.5, Math.min(1.5, orbitAngleX));
    });
    window.addEventListener('mouseup', () => { orbitDragging = false; });
    window.addEventListener('wheel', (e) => {
      if (!orbitMode) return;
      orbitZoom += e.deltaY * 0.003;
      orbitZoom = Math.max(1.5, Math.min(15, orbitZoom));
    }, { passive: true });
  }

  orbitUI.style.display = 'flex';
}

function exitOrbit() {
  orbitMode = false;
  orbitDragging = false;
  orbitBtn.style.display = 'block';
  document.getElementById('reviewBtn').style.display = 'block';
  if (orbitUI) orbitUI.style.display = 'none';
  closeDropdown();
}

orbitBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  enterOrbit();
});

function updateOrbit() {
  if (!orbitMode) return;

  const allCanvases = [
    earthCanvas, moonCanvas, marsCanvas, jupiterCanvas,
    saturnCanvas, uranusCanvas, neptuneCanvas, plutoCanvas,
    issCanvas, voyagerCanvas, asteroidsCanvas, kuiperCanvas
  ];
  for (const c of allCanvases) {
    if (c) { c.style.opacity = '0'; c.style.display = 'block'; }
  }

  const obj = getOrbitObject(orbitTarget);
  if (!obj) return;

  const nowAspect = window.innerWidth / window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio, 1.5);

  if (Math.abs(obj.camera.aspect - nowAspect) > 0.001) {
    obj.camera.aspect = nowAspect;
    obj.renderer.setPixelRatio(dpr);
    obj.renderer.setSize(window.innerWidth, window.innerHeight, false);
    obj.camera.updateProjectionMatrix();
  }

  obj.canvas.style.opacity = '1';
  obj.canvas.style.display = 'block';

  obj.camera.position.set(
    orbitZoom * Math.sin(orbitAngleY) * Math.cos(orbitAngleX),
    orbitZoom * Math.sin(orbitAngleX),
    orbitZoom * Math.cos(orbitAngleY) * Math.cos(orbitAngleX)
  );
  obj.camera.lookAt(0, 0, 0);

  if (obj.group) {
    obj.group.position.set(0, 0, 0);
    obj.group.scale.setScalar(1);
    obj.group.rotation.z = obj.tilt;
  }
  obj.mesh.position.set(0, 0, 0);
  obj.mesh.scale.setScalar(1);
  obj.mesh.visible = true;

  if (obj.halo) {
    obj.halo.position.set(0, 0, 0);
    obj.halo.scale.setScalar(1.06);
    obj.halo.visible = true;
  }

  if (orbitTarget === 'earth') {
    cloudMesh.visible = true;
    cloudMesh.position.set(0, 0, 0);
    cloudMesh.scale.setScalar(1.012);
    atmoInner.visible = true;
    atmoInner.position.set(0, 0, 0);
    atmoInner.scale.setScalar(1.025);
    atmoOuter.visible = true;
    atmoOuter.position.set(0, 0, 0);
    atmoOuter.scale.setScalar(1.12);
    earthUniforms.nightLights.value = 1.0;
  }

  if (orbitTarget === 'mars') { phobosMesh.visible = false; deimosMesh.visible = false; }
  if (orbitTarget === 'jupiter') { galileanMeshes.forEach(g => g.mesh.visible = false); }
  if (orbitTarget === 'saturn') titanMesh.visible = false;
  if (orbitTarget === 'uranus') { titaniaMesh.visible = false; oberonMesh.visible = false; }
  if (orbitTarget === 'neptune') tritonMesh.visible = false;
  if (orbitTarget === 'pluto')   charonMesh.visible = false;

  if (orbitTarget !== 'iss' && orbitTarget !== 'voyager') {
    obj.mesh.rotation.y += 0.0008;
  } else {
    obj.mesh.rotation.y += 0.0015;
    obj.mesh.rotation.x = 0;
    obj.mesh.rotation.z = 0;
  }

  obj.renderer.render(obj.scene, obj.camera);
}