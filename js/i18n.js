/* =========================================================
   I18N — локализация: RU, EN, ES, FR, PT, ZH
   ========================================================= */

const TRANSLATIONS = {
  ru: {
    'title': 'Полёт — от Земли до края Вселенной',
    'unit': 'КМ ОТ ЗЕМЛИ', 'hint': 'КЛИКНИ',
    'donate': 'ПОДДЕРЖАТЬ', 'donateThanks': 'Спасибо! Здесь будет ссылка на донат.',
    'reviewBtn': '🎬 СМОТРЕТЬ ПОЛЁТ', 'orbitBtn': '🛰 ОБЗОР',
    'jumpPlaceholder': 'введи км',
    'orbitSelect': 'Выбрать объект',
    'orbitEarth': '🌍 Земля', 'orbitMoon': '🌕 Луна', 'orbitMars': '🔴 Марс',
    'orbitJupiter': '🟠 Юпитер', 'orbitSaturn': '🪐 Сатурн',
    'orbitUranus': '🔵 Уран', 'orbitNeptune': '🔷 Нептун',
    'orbitPluto': '🤍 Плутон', 'orbitISS': '🛰 МКС',
    'orbitVoyager': '🛸 Вояджер',
    'orbitHint': 'Мышь — вращение · Колёсико — зум · Esc — выход',
    'orbitBack': '✕ Вернуться в полёт',
    'orbitLoading': 'Загрузка…',
    'ms_10': '10 км. Вы оторвались от земли.',
    'ms_100': '100 км. Линия Кармана. Здесь начинается космос.',
    'ms_400': '400 км. МКС.', 'ms_moon': '384 400 км. ЛУНА.',
    'ms_lagrange': '1.5 млн км. Точки Лагранжа L1 и L2.',
    'ms_venus': '41 млн км. ВЕНЕРА.', 'ms_mercury': '77 млн км. МЕРКУРИЙ.',
    'ms_mars': '225 млн км. МАРС.', 'ms_belt': '400 млн км. ПОЯС АСТЕРОИДОВ.',
    'ms_jupiter': '628 млн км. ЮПИТЕР.', 'ms_saturn': '1.27 млрд км. САТУРН.',
    'ms_uranus': '2.7 млрд км. УРАН.', 'ms_neptune': '4.35 млрд км. НЕПТУН.',
    'ms_kuiper': '5 млрд км. ПОЯС КОЙПЕРА.', 'ms_pluto': '5.9 млрд км. ПЛУТОН.',
    'ms_voyager': '24 млрд км. ВОЯДЖЕР-1.',
    'ms_alpha': '4.24 световых года. АЛЬФА ЦЕНТАВРА.',
    'ms_sirius': '8.6 световых лет. СИРИУС.',
    'ms_betel': '640 световых лет. БЕТЕЛЬГЕЙЗЕ.',
    'ms_milky': '100 000 световых лет. КРАЙ МЛЕЧНОГО ПУТИ.',
    'ms_edge': '46.5 млрд световых лет. ГОРИЗОНТ ВСЕЛЕННОЙ.',
    'scale_earth': 'Земля', 'scale_iss': 'МКС', 'scale_moon': 'Луна',
    'scale_mars': 'Марс', 'scale_belt': 'Пояс', 'scale_jupiter': 'Юпитер',
    'scale_saturn': 'Сатурн', 'scale_uranus': 'Уран', 'scale_neptune': 'Нептун',
    'scale_pluto': 'Плутон', 'scale_voyager': 'Вояджер', 'scale_alpha': 'α Cen',
    'rv_start': 'Старт', 'rv_atmo': 'Атмосфера', 'rv_orbit': 'Орбита',
    'rv_earthNear': 'Земля вблизи', 'rv_earthLeaves': 'Земля уходит',
    'rv_moonFar': 'Луна вдали', 'rv_moonPeak': 'Луна — пик', 'rv_moonGone': 'Луна исчезла',
    'rv_interplanet': 'Межпланетный космос', 'rv_marsPeak': 'Марс — пик',
    'rv_belt': 'Пояс астероидов', 'rv_jupiterPeak': 'Юпитер — пик',
    'rv_saturnPeak': 'Сатурн — пик', 'rv_uranusPeak': 'Уран — пик',
    'rv_neptunePeak': 'Нептун — пик', 'rv_kuiper': 'Пояс Койпера', 'rv_plutoPeak': 'Плутон — пик'
  },

  en: {
    'title': 'Flight — From Earth to the Edge of the Universe',
    'unit': 'KM FROM EARTH', 'hint': 'CLICK',
    'donate': 'SUPPORT', 'donateThanks': 'Thanks! Donation link coming soon.',
    'reviewBtn': '🎬 WATCH FLIGHT', 'orbitBtn': '🛰 ORBIT VIEW',
    'jumpPlaceholder': 'enter km',
    'orbitSelect': 'Select object',
    'orbitEarth': '🌍 Earth', 'orbitMoon': '🌕 Moon', 'orbitMars': '🔴 Mars',
    'orbitJupiter': '🟠 Jupiter', 'orbitSaturn': '🪐 Saturn',
    'orbitUranus': '🔵 Uranus', 'orbitNeptune': '🔷 Neptune',
    'orbitPluto': '🤍 Pluto', 'orbitISS': '🛰 ISS',
    'orbitVoyager': '🛸 Voyager',
    'orbitHint': 'Drag — rotate · Wheel — zoom · Esc — exit',
    'orbitBack': '✕ Back to flight',
    'orbitLoading': 'Loading…',
    'ms_10': '10 km. You have left the ground.',
    'ms_100': '100 km. Kármán line. Space begins here.',
    'ms_400': '400 km. ISS.', 'ms_moon': '384,400 km. THE MOON.',
    'ms_lagrange': '1.5 million km. Lagrange points L1 and L2.',
    'ms_venus': '41 million km. VENUS.', 'ms_mercury': '77 million km. MERCURY.',
    'ms_mars': '225 million km. MARS.', 'ms_belt': '400 million km. ASTEROID BELT.',
    'ms_jupiter': '628 million km. JUPITER.', 'ms_saturn': '1.27 billion km. SATURN.',
    'ms_uranus': '2.7 billion km. URANUS.', 'ms_neptune': '4.35 billion km. NEPTUNE.',
    'ms_kuiper': '5 billion km. KUIPER BELT.', 'ms_pluto': '5.9 billion km. PLUTO.',
    'ms_voyager': '24 billion km. VOYAGER 1.',
    'ms_alpha': '4.24 light-years. ALPHA CENTAURI.',
    'ms_sirius': '8.6 light-years. SIRIUS.',
    'ms_betel': '640 light-years. BETELGEUSE.',
    'ms_milky': '100,000 light-years. EDGE OF THE MILKY WAY.',
    'ms_edge': '46.5 billion light-years. EDGE OF THE UNIVERSE.',
    'scale_earth': 'Earth', 'scale_iss': 'ISS', 'scale_moon': 'Moon',
    'scale_mars': 'Mars', 'scale_belt': 'Belt', 'scale_jupiter': 'Jupiter',
    'scale_saturn': 'Saturn', 'scale_uranus': 'Uranus', 'scale_neptune': 'Neptune',
    'scale_pluto': 'Pluto', 'scale_voyager': 'Voyager', 'scale_alpha': 'α Cen',
    'rv_start': 'Start', 'rv_atmo': 'Atmosphere', 'rv_orbit': 'Orbit',
    'rv_earthNear': 'Earth close', 'rv_earthLeaves': 'Earth leaves',
    'rv_moonFar': 'Moon far', 'rv_moonPeak': 'Moon — peak', 'rv_moonGone': 'Moon gone',
    'rv_interplanet': 'Interplanetary space', 'rv_marsPeak': 'Mars — peak',
    'rv_belt': 'Asteroid belt', 'rv_jupiterPeak': 'Jupiter — peak',
    'rv_saturnPeak': 'Saturn — peak', 'rv_uranusPeak': 'Uranus — peak',
    'rv_neptunePeak': 'Neptune — peak', 'rv_kuiper': 'Kuiper belt', 'rv_plutoPeak': 'Pluto — peak'
  },

  es: {
    'title': 'Vuelo — De la Tierra al borde del Universo',
    'unit': 'KM DE LA TIERRA', 'hint': 'HAZ CLIC',
    'donate': 'APOYAR', 'donateThanks': '¡Gracias! Enlace de donación próximamente.',
    'reviewBtn': '🎬 VER VUELO', 'orbitBtn': '🛰 VISTA ORBITAL',
    'jumpPlaceholder': 'ingresa km',
    'orbitSelect': 'Elegir objeto',
    'orbitEarth': '🌍 Tierra', 'orbitMoon': '🌕 Luna', 'orbitMars': '🔴 Marte',
    'orbitJupiter': '🟠 Júpiter', 'orbitSaturn': '🪐 Saturno',
    'orbitUranus': '🔵 Urano', 'orbitNeptune': '🔷 Neptuno',
    'orbitPluto': '🤍 Plutón', 'orbitISS': '🛰 EEI',
    'orbitVoyager': '🛸 Voyager',
    'orbitHint': 'Arrastra — girar · Rueda — zoom · Esc — salir',
    'orbitBack': '✕ Volver al vuelo', 'orbitLoading': 'Cargando…',
    'ms_10': '10 km. Has dejado el suelo.',
    'ms_100': '100 km. Línea de Kármán. Aquí empieza el espacio.',
    'ms_400': '400 km. EEI.', 'ms_moon': '384 400 km. LA LUNA.',
    'ms_lagrange': '1,5 millones km. Puntos de Lagrange L1 y L2.',
    'ms_venus': '41 millones km. VENUS.', 'ms_mercury': '77 millones km. MERCURIO.',
    'ms_mars': '225 millones km. MARTE.', 'ms_belt': '400 millones km. CINTURÓN DE ASTEROIDES.',
    'ms_jupiter': '628 millones km. JÚPITER.', 'ms_saturn': '1,27 mil millones km. SATURNO.',
    'ms_uranus': '2,7 mil millones km. URANO.', 'ms_neptune': '4,35 mil millones km. NEPTUNO.',
    'ms_kuiper': '5 mil millones km. CINTURÓN DE KUIPER.', 'ms_pluto': '5,9 mil millones km. PLUTÓN.',
    'ms_voyager': '24 mil millones km. VOYAGER 1.',
    'ms_alpha': '4,24 años luz. ALFA CENTAURI.',
    'ms_sirius': '8,6 años luz. SIRIO.', 'ms_betel': '640 años luz. BETELGEUSE.',
    'ms_milky': '100 000 años luz. BORDE DE LA VÍA LÁCTEA.',
    'ms_edge': '46,5 mil millones años luz. HORIZONTE DEL UNIVERSO.',
    'scale_earth': 'Tierra', 'scale_iss': 'EEI', 'scale_moon': 'Luna',
    'scale_mars': 'Marte', 'scale_belt': 'Cinturón', 'scale_jupiter': 'Júpiter',
    'scale_saturn': 'Saturno', 'scale_uranus': 'Urano', 'scale_neptune': 'Neptuno',
    'scale_pluto': 'Plutón', 'scale_voyager': 'Voyager', 'scale_alpha': 'α Cen',
    'rv_start': 'Inicio', 'rv_atmo': 'Atmósfera', 'rv_orbit': 'Órbita',
    'rv_earthNear': 'Tierra cerca', 'rv_earthLeaves': 'Tierra se aleja',
    'rv_moonFar': 'Luna lejos', 'rv_moonPeak': 'Luna — máximo', 'rv_moonGone': 'Luna desaparece',
    'rv_interplanet': 'Espacio interplanetario', 'rv_marsPeak': 'Marte — máximo',
    'rv_belt': 'Cinturón de asteroides', 'rv_jupiterPeak': 'Júpiter — máximo',
    'rv_saturnPeak': 'Saturno — máximo', 'rv_uranusPeak': 'Urano — máximo',
    'rv_neptunePeak': 'Neptuno — máximo', 'rv_kuiper': 'Cinturón de Kuiper', 'rv_plutoPeak': 'Plutón — máximo'
  },

  fr: {
    'title': 'Vol — De la Terre aux confins de l\'Univers',
    'unit': 'KM DE LA TERRE', 'hint': 'CLIQUEZ',
    'donate': 'SOUTENIR', 'donateThanks': 'Merci ! Lien de don à venir.',
    'reviewBtn': '🎬 VOIR LE VOL', 'orbitBtn': '🛰 VUE ORBITALE',
    'jumpPlaceholder': 'entrez km',
    'orbitSelect': 'Choisir un objet',
    'orbitEarth': '🌍 Terre', 'orbitMoon': '🌕 Lune', 'orbitMars': '🔴 Mars',
    'orbitJupiter': '🟠 Jupiter', 'orbitSaturn': '🪐 Saturne',
    'orbitUranus': '🔵 Uranus', 'orbitNeptune': '🔷 Neptune',
    'orbitPluto': '🤍 Pluton', 'orbitISS': '🛰 ISS',
    'orbitVoyager': '🛸 Voyager',
    'orbitHint': 'Glisser — tourner · Molette — zoom · Échap — quitter',
    'orbitBack': '✕ Retour au vol', 'orbitLoading': 'Chargement…',
    'ms_10': '10 km. Vous avez quitté le sol.',
    'ms_100': '100 km. Ligne de Kármán. L\'espace commence ici.',
    'ms_400': '400 km. ISS.', 'ms_moon': '384 400 km. LA LUNE.',
    'ms_lagrange': '1,5 million km. Points de Lagrange L1 et L2.',
    'ms_venus': '41 millions km. VÉNUS.', 'ms_mercury': '77 millions km. MERCURE.',
    'ms_mars': '225 millions km. MARS.', 'ms_belt': '400 millions km. CEINTURE D\'ASTÉROÏDES.',
    'ms_jupiter': '628 millions km. JUPITER.', 'ms_saturn': '1,27 milliard km. SATURNE.',
    'ms_uranus': '2,7 milliards km. URANUS.', 'ms_neptune': '4,35 milliards km. NEPTUNE.',
    'ms_kuiper': '5 milliards km. CEINTURE DE KUIPER.', 'ms_pluto': '5,9 milliards km. PLUTON.',
    'ms_voyager': '24 milliards km. VOYAGER 1.',
    'ms_alpha': '4,24 années-lumière. ALPHA DU CENTAURE.',
    'ms_sirius': '8,6 années-lumière. SIRIUS.', 'ms_betel': '640 années-lumière. BÉTELGEUSE.',
    'ms_milky': '100 000 années-lumière. BORD DE LA VOIE LACTÉE.',
    'ms_edge': '46,5 milliards années-lumière. HORIZON DE L\'UNIVERS.',
    'scale_earth': 'Terre', 'scale_iss': 'ISS', 'scale_moon': 'Lune',
    'scale_mars': 'Mars', 'scale_belt': 'Ceinture', 'scale_jupiter': 'Jupiter',
    'scale_saturn': 'Saturne', 'scale_uranus': 'Uranus', 'scale_neptune': 'Neptune',
    'scale_pluto': 'Pluton', 'scale_voyager': 'Voyager', 'scale_alpha': 'α Cen',
    'rv_start': 'Départ', 'rv_atmo': 'Atmosphère', 'rv_orbit': 'Orbite',
    'rv_earthNear': 'Terre proche', 'rv_earthLeaves': 'La Terre s\'éloigne',
    'rv_moonFar': 'Lune au loin', 'rv_moonPeak': 'Lune — pic', 'rv_moonGone': 'Lune disparue',
    'rv_interplanet': 'Espace interplanétaire', 'rv_marsPeak': 'Mars — pic',
    'rv_belt': 'Ceinture d\'astéroïdes', 'rv_jupiterPeak': 'Jupiter — pic',
    'rv_saturnPeak': 'Saturne — pic', 'rv_uranusPeak': 'Uranus — pic',
    'rv_neptunePeak': 'Neptune — pic', 'rv_kuiper': 'Ceinture de Kuiper', 'rv_plutoPeak': 'Pluton — pic'
  },

  pt: {
    'title': 'Voo — Da Terra até a borda do Universo',
    'unit': 'KM DA TERRA', 'hint': 'CLIQUE',
    'donate': 'APOIAR', 'donateThanks': 'Obrigado! Link de doação em breve.',
    'reviewBtn': '🎬 VER VOO', 'orbitBtn': '🛰 VISTA ORBITAL',
    'jumpPlaceholder': 'digite km',
    'orbitSelect': 'Escolher objeto',
    'orbitEarth': '🌍 Terra', 'orbitMoon': '🌕 Lua', 'orbitMars': '🔴 Marte',
    'orbitJupiter': '🟠 Júpiter', 'orbitSaturn': '🪐 Saturno',
    'orbitUranus': '🔵 Urano', 'orbitNeptune': '🔷 Netuno',
    'orbitPluto': '🤍 Plutão', 'orbitISS': '🛰 ISS',
    'orbitVoyager': '🛸 Voyager',
    'orbitHint': 'Arraste — girar · Roda — zoom · Esc — sair',
    'orbitBack': '✕ Voltar ao voo', 'orbitLoading': 'Carregando…',
    'ms_10': '10 km. Você deixou o solo.',
    'ms_100': '100 km. Linha de Kármán. O espaço começa aqui.',
    'ms_400': '400 km. ISS.', 'ms_moon': '384 400 km. A LUA.',
    'ms_lagrange': '1,5 milhão km. Pontos de Lagrange L1 e L2.',
    'ms_venus': '41 milhões km. VÊNUS.', 'ms_mercury': '77 milhões km. MERCÚRIO.',
    'ms_mars': '225 milhões km. MARTE.', 'ms_belt': '400 milhões km. CINTURÃO DE ASTEROIDES.',
    'ms_jupiter': '628 milhões km. JÚPITER.', 'ms_saturn': '1,27 bilhão km. SATURNO.',
    'ms_uranus': '2,7 bilhões km. URANO.', 'ms_neptune': '4,35 bilhões km. NETUNO.',
    'ms_kuiper': '5 bilhões km. CINTURÃO DE KUIPER.', 'ms_pluto': '5,9 bilhões km. PLUTÃO.',
    'ms_voyager': '24 bilhões km. VOYAGER 1.',
    'ms_alpha': '4,24 anos-luz. ALFA CENTAURO.',
    'ms_sirius': '8,6 anos-luz. SÍRIUS.', 'ms_betel': '640 anos-luz. BETELGEUSE.',
    'ms_milky': '100 000 anos-luz. BORDA DA VIA LÁCTEA.',
    'ms_edge': '46,5 bilhões anos-luz. HORIZONTE DO UNIVERSO.',
    'scale_earth': 'Terra', 'scale_iss': 'ISS', 'scale_moon': 'Lua',
    'scale_mars': 'Marte', 'scale_belt': 'Cinturão', 'scale_jupiter': 'Júpiter',
    'scale_saturn': 'Saturno', 'scale_uranus': 'Urano', 'scale_neptune': 'Netuno',
    'scale_pluto': 'Plutão', 'scale_voyager': 'Voyager', 'scale_alpha': 'α Cen',
    'rv_start': 'Início', 'rv_atmo': 'Atmosfera', 'rv_orbit': 'Órbita',
    'rv_earthNear': 'Terra perto', 'rv_earthLeaves': 'Terra se afasta',
    'rv_moonFar': 'Lua ao longe', 'rv_moonPeak': 'Lua — pico', 'rv_moonGone': 'Lua sumiu',
    'rv_interplanet': 'Espaço interplanetário', 'rv_marsPeak': 'Marte — pico',
    'rv_belt': 'Cinturão de asteroides', 'rv_jupiterPeak': 'Júpiter — pico',
    'rv_saturnPeak': 'Saturno — pico', 'rv_uranusPeak': 'Urano — pico',
    'rv_neptunePeak': 'Netuno — pico', 'rv_kuiper': 'Cinturão de Kuiper', 'rv_plutoPeak': 'Plutão — pico'
  },

  zh: {
    'title': '飞行 — 从地球到宇宙边缘',
    'unit': '距地球公里数', 'hint': '点击',
    'donate': '支持', 'donateThanks': '谢谢！捐赠链接即将上线。',
    'reviewBtn': '🎬 观看飞行', 'orbitBtn': '🛰 轨道视图',
    'jumpPlaceholder': '输入公里',
    'orbitSelect': '选择天体',
    'orbitEarth': '🌍 地球', 'orbitMoon': '🌕 月球', 'orbitMars': '🔴 火星',
    'orbitJupiter': '🟠 木星', 'orbitSaturn': '🪐 土星',
    'orbitUranus': '🔵 天王星', 'orbitNeptune': '🔷 海王星',
    'orbitPluto': '🤍 冥王星', 'orbitISS': '🛰 国际空间站',
    'orbitVoyager': '🛸 旅行者号',
    'orbitHint': '拖动 — 旋转 · 滚轮 — 缩放 · Esc — 退出',
    'orbitBack': '✕ 返回飞行', 'orbitLoading': '加载中…',
    'ms_10': '10 公里。你已离开地面。',
    'ms_100': '100 公里。卡门线。太空从这里开始。',
    'ms_400': '400 公里。国际空间站。', 'ms_moon': '384 400 公里。月球。',
    'ms_lagrange': '150 万公里。拉格朗日点 L1 和 L2。',
    'ms_venus': '4100 万公里。金星。', 'ms_mercury': '7700 万公里。水星。',
    'ms_mars': '2.25 亿公里。火星。', 'ms_belt': '4 亿公里。小行星带。',
    'ms_jupiter': '6.28 亿公里。木星。', 'ms_saturn': '12.7 亿公里。土星。',
    'ms_uranus': '27 亿公里。天王星。', 'ms_neptune': '43.5 亿公里。海王星。',
    'ms_kuiper': '50 亿公里。柯伊伯带。', 'ms_pluto': '59 亿公里。冥王星。',
    'ms_voyager': '240 亿公里。旅行者 1 号。',
    'ms_alpha': '4.24 光年。半人马座 α 星。',
    'ms_sirius': '8.6 光年。天狼星。', 'ms_betel': '640 光年。参宿四。',
    'ms_milky': '10 万光年。银河系边缘。', 'ms_edge': '465 亿光年。宇宙视界。',
    'scale_earth': '地球', 'scale_iss': '国际空间站', 'scale_moon': '月球',
    'scale_mars': '火星', 'scale_belt': '小行星带', 'scale_jupiter': '木星',
    'scale_saturn': '土星', 'scale_uranus': '天王星', 'scale_neptune': '海王星',
    'scale_pluto': '冥王星', 'scale_voyager': '旅行者', 'scale_alpha': '半人马 α',
    'rv_start': '开始', 'rv_atmo': '大气层', 'rv_orbit': '轨道',
    'rv_earthNear': '地球近处', 'rv_earthLeaves': '地球远去',
    'rv_moonFar': '月球远处', 'rv_moonPeak': '月球 — 巅峰', 'rv_moonGone': '月球消失',
    'rv_interplanet': '行星际空间', 'rv_marsPeak': '火星 — 巅峰',
    'rv_belt': '小行星带', 'rv_jupiterPeak': '木星 — 巅峰',
    'rv_saturnPeak': '土星 — 巅峰', 'rv_uranusPeak': '天王星 — 巅峰',
    'rv_neptunePeak': '海王星 — 巅峰', 'rv_kuiper': '柯伊伯带', 'rv_plutoPeak': '冥王星 — 巅峰'
  }
};

let currentLang = 'ru';

function t(key) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.ru;
  return dict[key] || TRANSLATIONS.ru[key] || key;
}

function currentLocale() {
  const map = { ru: 'ru-RU', en: 'en-US', es: 'es-ES', fr: 'fr-FR', pt: 'pt-BR', zh: 'zh-CN' };
  return map[currentLang] || 'en-US';
}

function detectLanguage() {
  const saved = localStorage.getItem('space_lang');
  if (saved && TRANSLATIONS[saved]) return saved;

  const langs = navigator.languages || [navigator.language || 'en'];
  for (const raw of langs) {
    const code = raw.toLowerCase();
    if (code.startsWith('ru')) return 'ru';
    if (code.startsWith('en')) return 'en';
    if (code.startsWith('es')) return 'es';
    if (code.startsWith('fr')) return 'fr';
    if (code.startsWith('pt')) return 'pt';
    if (code.startsWith('zh')) return 'zh';
  }
  return 'en';
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.documentElement.setAttribute('data-lang', currentLang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);

    /* Защита от автоперевода браузера */
    el.setAttribute('translate', 'no');
    el.classList.add('notranslate');

    /* Убрать вставки ya-tr-span / google-translate */
    el.querySelectorAll('ya-tr-span, .ya-tr-span, font').forEach(sp => {
      const txt = sp.textContent;
      sp.replaceWith(document.createTextNode(txt));
    });

    if (el.textContent !== val) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
    el.setAttribute('translate', 'no');
    el.classList.add('notranslate');
  });

  const titleKey = document.body.getAttribute('data-i18n-title');
  if (titleKey) document.title = t(titleKey);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });

  if (typeof updateOrbitLabels === 'function') updateOrbitLabels();
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem('space_lang', lang);
  applyTranslations();
  if (typeof drawScale === 'function') drawScale();
  if (typeof reviewMode !== 'undefined' && reviewMode) {
    const lbl = document.getElementById('reviewKmLabel');
    if (lbl && typeof viewKm !== 'undefined') lbl.textContent = formatKmNumber(viewKm);
  }
}

/* ---------- ИНИЦИАЛИЗАЦИЯ ---------- */
currentLang = detectLanguage();

function initI18n() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.i18nBound) return;
    btn.dataset.i18nBound = '1';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setLanguage(btn.dataset.lang);
    });
  });
  applyTranslations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
window.addEventListener('load', initI18n);