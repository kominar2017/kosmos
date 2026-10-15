/* =========================================================
   GLOBAL — общий счётчик кликов человечества
   Батчинг: клики копятся локально, раз в секунду отправка
   ========================================================= */

const GLOBAL_API = 'https://closer2stars.com/api';
const GLOBAL_BATCH_INTERVAL = 1000; // 1 секунда

let pendingClicks = 0;
let globalTotal = 0;
let globalTimer = null;

// Добавить клик в буфер (вызывается при каждом клике)
function addGlobalClick() {
  pendingClicks++;
  if (!globalTimer) {
    globalTimer = setTimeout(flushClicks, GLOBAL_BATCH_INTERVAL);
  }
}

// Отправить накопленные клики
async function flushClicks() {
  if (pendingClicks === 0) {
    globalTimer = null;
    return;
  }

  const clicksToSend = pendingClicks;
  pendingClicks = 0;
  globalTimer = null;

  try {
    const res = await fetch(`${GLOBAL_API}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clicks: clicksToSend })
    });
    const data = await res.json();
    if (data.total !== undefined) {
      globalTotal = data.total;
      updateGlobalUI();
    }
  } catch (e) {
    console.warn('[GLOBAL] Ошибка отправки:', e);
    // Возвращаем клики в буфер, попробуем позже
    pendingClicks += clicksToSend;
  }
}

// Загрузить общий счётчик при старте
async function loadGlobalTotal() {
  try {
    const res = await fetch(`${GLOBAL_API}/global`);
    const data = await res.json();
    if (data.total !== undefined) {
      globalTotal = data.total;
      updateGlobalUI();
    }
  } catch (e) {
    console.warn('[GLOBAL] Ошибка загрузки:', e);
  }
}

// Обновить UI
function updateGlobalUI() {
  const el = document.getElementById('globalCount');
  if (el) el.textContent = formatGlobalNumber(globalTotal);
}

// Форматирование: 1234567 → "1 234 567"
function formatGlobalNumber(n) {
  return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// При получении обновления от WebSocket
function onGlobalUpdate(total) {
  globalTotal = total;
  updateGlobalUI();
}

// Запуск
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGlobalTotal);
} else {
  loadGlobalTotal();
}