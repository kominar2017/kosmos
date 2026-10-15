/* =========================================================
   TOP-10 — раскрывающийся список лидеров
   ========================================================= */

const TOP_API = 'https://closer2stars.com/api';
let topRefreshTimer = null;
let topOpen = false;

/* --- Получить имя игрока --- */
function getPlayerName() {
  let name = localStorage.getItem('space_player_name');
  if (!name) {
    name = prompt('Как тебя зовут?', 'Аноним') || 'Аноним';
    name = name.trim().slice(0, 20);
    if (!name) name = 'Аноним';
    localStorage.setItem('space_player_name', name);
  }
  return name;
}

/* --- Отправить рекорд --- */
async function submitScore() {
  const name = getPlayerName();
  const km = Number(distance);
  if (km < 100) return;

  try {
    await fetch(`${TOP_API}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, km })
    });
  } catch (e) {
    console.warn('[TOP10] Ошибка отправки:', e);
  }
}

/* --- Загрузить топ-10 --- */
async function loadTop10() {
  const listEl = document.getElementById('top10List');
  if (!listEl) return;

  listEl.innerHTML = '<div class="top10-loading">Загрузка...</div>';

  try {
    const res = await fetch(`${TOP_API}/top10`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      listEl.innerHTML = '<div class="top10-empty">Пока никто не летал</div>';
      return;
    }

    const myName = localStorage.getItem('space_player_name') || '';
    listEl.innerHTML = data.map((row, i) => {
      const rank = i + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank + '.';
      const isMe = row.name === myName ? ' top10-me' : '';
      const km = formatGlobalNumber(row.km);
      return `<div class="top10-row${isMe}">
        <span class="top10-rank">${medal}</span>
        <span class="top10-name">${escapeHtml(row.name)}</span>
        <span class="top10-km">${km}</span>
      </div>`;
    }).join('');
  } catch (e) {
    console.warn('[TOP10] Ошибка загрузки:', e);
    listEl.innerHTML = '<div class="top10-empty">Ошибка загрузки</div>';
  }
}

/* --- Открыть/закрыть раскрывающийся список --- */
function toggleTop10() {
  const dropdown = document.getElementById('top10Dropdown');
  if (!dropdown) return;

  topOpen = !topOpen;
  dropdown.classList.toggle('open', topOpen);

  if (topOpen) {
    loadTop10();
    if (topRefreshTimer) clearInterval(topRefreshTimer);
    topRefreshTimer = setInterval(loadTop10, 30000);
  } else {
    if (topRefreshTimer) {
      clearInterval(topRefreshTimer);
      topRefreshTimer = null;
    }
  }
}

/* --- Экранирование HTML --- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* --- Инициализация --- */
function initTop10() {
  const toggleBtn = document.getElementById('top10Toggle');
  const dropdown = document.getElementById('top10Dropdown');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTop10();
    });
  }

  // Закрытие при клике вне
  document.addEventListener('click', (e) => {
    if (!topOpen) return;
    if (e.target.closest('#top10Dropdown')) return;
    toggleTop10();
  });

  // Отправка рекорда раз в 30 секунд
  setInterval(submitScore, 30000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTop10);
} else {
  initTop10();
}