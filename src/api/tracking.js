import { openSse } from '../utils/sse';
import client, { getAccessTokenForStream, refreshSessionForStream } from './client';

const IDLE_MS = 45000;
const MAX_WAIT_MS = 30000;

function toFix(data) {
  const body = JSON.parse(data);
  const loc = body.data || body.location || body.payload || body.bus_location || body.signal || body;
  const lat = Number(loc.latitude ?? loc.lat);
  const lng = Number(loc.longitude ?? loc.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    point: [lng, lat],
    timestamp: Date.parse(loc.timestamp || body.timestamp) || Date.now(),
  };
}

export function connectBusTracking(busId, { onLocation, onStatus }) {
  const url = `${client.defaults.baseURL}/api/v1/tracking/buses/${encodeURIComponent(busId)}/events`;
  let closeStream = null;
  let idleTimer = null;
  let retryTimer = null;
  let attempt = 0;
  let refreshed = false;
  let stopped = false;

  function stop() {
    stopped = true;
    clearTimeout(idleTimer);
    clearTimeout(retryTimer);
    closeStream?.();
  }

  function retry() {
    clearTimeout(idleTimer);
    closeStream?.();
    closeStream = null;
    if (stopped) return;
    onStatus('reconnecting');
    const wait = Math.min(2000 * 2 ** attempt, MAX_WAIT_MS);
    attempt += 1;
    retryTimer = setTimeout(connect, wait);
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(retry, IDLE_MS);
  }

  async function handleClose(status) {
    if (stopped) return;
    if (status === 403) {
      stop();
      onStatus('noAccess');
      return;
    }
    if (status === 401) {
      if (!refreshed && (await refreshSessionForStream())) {
        refreshed = true;
        connect();
        return;
      }
      stop();
      onStatus('signedOut');
      return;
    }
    retry();
  }

  async function connect() {
    if (stopped) return;
    onStatus(attempt === 0 ? 'connecting' : 'reconnecting');
    const token = await getAccessTokenForStream();
    if (stopped) return;
    closeStream = openSse(url, {
      headers: { Authorization: `Bearer ${token}` },
      onOpen() {
        attempt = 0;
        refreshed = false;
        onStatus('live');
      },
      onActivity: resetIdleTimer,
      onEvent({ event, data }) {
        if (event === 'no_active_trip') {
          stop();
          onStatus('ended');
          return;
        }
        if (event !== 'location') return;
        try {
          const fix = toFix(data);
          if (fix) onLocation(fix);
        } catch {
        }
      },
      onClose: handleClose,
    });
    resetIdleTimer();
  }

  connect();
  return stop;
}
