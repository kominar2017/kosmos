/* =========================================================
   ONLINE — счётчик онлайн через WebSocket
   ========================================================= */

let onlineSocket = null;
let onlineReconnectTimer = null;
let onlinePingTimer = null;

function connectOnline() {
  if (onlineSocket && onlineSocket.readyState === WebSocket.OPEN) return;

  try {
    onlineSocket = new WebSocket('wss://closer2stars.com/ws');
  } catch (e) {
    console.warn('[ONLINE] Не удалось создать WebSocket:', e);
    scheduleReconnect();
    return;
  }

  onlineSocket.onopen = () => {
    console.log('[ONLINE] Подключено');

    const name = localStorage.getItem('space_player_name') || 'Аноним';
    onlineSocket.send(JSON.stringify({ type: 'name', name }));

    if (onlinePingTimer) clearInterval(onlinePingTimer);
    onlinePingTimer = setInterval(() => {
      if (onlineSocket && onlineSocket.readyState === WebSocket.OPEN) {
        onlineSocket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  };

  onlineSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'online') {
        updateOnlineUI(data.count);
      }
      if (data.type === 'global') {
        if (typeof onGlobalUpdate === 'function') {
          onGlobalUpdate(data.total);
        }
      }
    } catch (e) {
      console.warn('[ONLINE] Ошибка парсинга:', e);
    }
  };

  onlineSocket.onerror = (e) => {
    console.warn('[ONLINE] Ошибка:', e);
  };

  onlineSocket.onclose = () => {
    console.log('[ONLINE] Отключено');
    if (onlinePingTimer) {
      clearInterval(onlinePingTimer);
      onlinePingTimer = null;
    }
    scheduleReconnect();
  };
}

function scheduleReconnect() {
  if (onlineReconnectTimer) return;
  onlineReconnectTimer = setTimeout(() => {
    onlineReconnectTimer = null;
    connectOnline();
  }, 5000);
}

function updateOnlineUI(count) {
  const el = document.getElementById('onlineCount');
  if (el) el.textContent = count;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', connectOnline);
} else {
  connectOnline();
}