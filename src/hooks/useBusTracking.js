import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import client, { getAccessTokenForStream, refreshSessionForStream } from '../api/client';
import { openSse } from '../utils/sse';

const IDLE_MS = 45000;
const BACKOFF_BASE_MS = 2000;
const BACKOFF_MAX_MS = 30000;

function finiteNumber(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function pointFrom(source) {
  if (!source || typeof source !== 'object') return null;
  const latitude = finiteNumber(source.latitude ?? source.lat);
  const longitude = finiteNumber(source.longitude ?? source.lng);
  if (latitude == null || longitude == null) return null;
  return [longitude, latitude];
}

function readTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1e12 ? value : value * 1000;
  }
  if (typeof value !== 'string' || !value.trim()) return null;
  const parsed = Date.parse(value);
  if (parsed) return parsed;
  const asNumber = Number(value);
  if (!Number.isFinite(asNumber)) return null;
  return asNumber > 1e12 ? asNumber : asNumber * 1000;
}

function fixFrom(payload) {
  const sources = [
    payload?.data,
    payload?.location,
    payload?.payload,
    payload?.bus_location,
    payload?.signal,
    payload,
  ];
  let point = null;
  let source = null;
  for (let i = 0; i < sources.length; i += 1) {
    const next = pointFrom(sources[i]);
    if (!next) continue;
    point = next;
    source = sources[i];
    break;
  }
  if (!point) return null;
  const timestamp = readTimestamp(source?.timestamp)
    ?? readTimestamp(payload?.timestamp)
    ?? Date.now();
  return { point, timestamp };
}

export default function useBusTracking(busId, { enabled = true } = {}) {
  const [status, setStatus] = useState(() => (busId && enabled ? 'connecting' : 'idle'));
  const [errorKind, setErrorKind] = useState(null);
  const [fix, setFix] = useState(null);
  const [lastFixAt, setLastFixAt] = useState(null);
  const closeRef = useRef(null);
  const idleTimerRef = useRef(null);
  const retryTimerRef = useRef(null);
  const attemptRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const previousBusRef = useRef(busId);

  useEffect(() => {
    if (previousBusRef.current !== busId) {
      previousBusRef.current = busId;
      lastTimestampRef.current = 0;
      setFix(null);
      setLastFixAt(null);
    }

    if (!busId || !enabled) {
      setStatus('idle');
      setErrorKind(null);
      return undefined;
    }

    let active = true;
    let suspended = AppState.currentState === 'background';
    let ended = false;
    let errorStop = false;
    let generation = 0;
    let authRetried = false;
    let refreshFlight = null;
    let phase = 'connecting';
    attemptRef.current = 0;

    function updateStatus(next) {
      phase = next;
      if (!active) return;
      setStatus(next);
    }

    function updateKind(next) {
      if (!active) return;
      setErrorKind(next);
    }

    function clearIdle() {
      if (idleTimerRef.current == null) return;
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    function clearRetry() {
      if (retryTimerRef.current == null) return;
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    function stopSocket() {
      clearIdle();
      const close = closeRef.current;
      closeRef.current = null;
      close?.();
    }

    function releaseSocket() {
      clearIdle();
      closeRef.current = null;
    }

    function fail(kind) {
      errorStop = true;
      clearRetry();
      stopSocket();
      updateStatus('error');
      updateKind(kind);
    }

    function scheduleReconnect(kind) {
      if (!active || suspended || ended || errorStop) return;
      updateStatus('reconnecting');
      updateKind(kind);
      const delay = Math.min(BACKOFF_BASE_MS * (2 ** attemptRef.current), BACKOFF_MAX_MS);
      attemptRef.current += 1;
      clearRetry();
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        openConnection();
      }, delay);
    }

    function requestRefresh() {
      if (!refreshFlight) {
        refreshFlight = refreshSessionForStream()
          .then(ok => !!ok)
          .catch(() => false)
          .finally(() => {
            refreshFlight = null;
          });
      }
      return refreshFlight;
    }

    function handleUnauthorized() {
      updateStatus('reconnecting');
      if (authRetried && !refreshFlight) {
        fail('session');
        return;
      }
      authRetried = true;
      requestRefresh().then(ok => {
        if (!active || ended || errorStop) return;
        if (!ok) {
          fail('session');
          return;
        }
        if (suspended) return;
        openConnection();
      });
    }

    async function openConnection() {
      if (!active || suspended || ended || errorStop) return;
      const gen = ++generation;
      clearRetry();
      stopSocket();
      if (phase === 'live' || phase === 'reconnecting' || attemptRef.current > 0) {
        updateStatus('reconnecting');
      } else {
        updateStatus('connecting');
      }

      let token = null;
      try {
        token = await getAccessTokenForStream();
      } catch {
        token = null;
      }
      if (!active || gen !== generation || suspended || ended || errorStop) return;
      if (!token) {
        handleUnauthorized();
        return;
      }

      const root = String(client.defaults.baseURL || '').replace(/\/$/, '');
      const url = `${root}/api/v1/tracking/buses/${encodeURIComponent(busId)}/events`;
      let settled = false;
      let closedStatus = null;

      function armIdle() {
        clearIdle();
        const timer = setTimeout(() => {
          if (idleTimerRef.current === timer) idleTimerRef.current = null;
          if (settled || !active || gen !== generation || suspended || ended || errorStop) return;
          settled = true;
          stopSocket();
          scheduleReconnect(null);
        }, IDLE_MS);
        idleTimerRef.current = timer;
      }

      function finish(statusCode) {
        if (settled || !active || gen !== generation || ended || errorStop) return;
        settled = true;
        releaseSocket();
        const code = statusCode || 0;
        closedStatus = code;
        if (code === 401) {
          handleUnauthorized();
          return;
        }
        if (code === 403) {
          fail('noAccess');
          return;
        }
        if (code >= 500 && code <= 599) {
          scheduleReconnect('server');
          return;
        }
        scheduleReconnect(code === 0 ? 'offline' : null);
      }

      const close = openSse(url, {
        headers: { Authorization: `Bearer ${token}` },
        onOpen() {
          if (settled || !active || gen !== generation || ended || errorStop) return;
          attemptRef.current = 0;
          authRetried = false;
          updateStatus('live');
          updateKind(null);
        },
        onActivity() {
          if (settled || !active || gen !== generation || ended || errorStop) return;
          armIdle();
        },
        onEvent({ event, data }) {
          if (settled || !active || gen !== generation || ended || errorStop) return;
          if (event === 'no_active_trip') {
            ended = true;
            settled = true;
            clearRetry();
            stopSocket();
            updateStatus('ended');
            return;
          }
          if (event !== 'location') return;
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            return;
          }
          const next = fixFrom(parsed);
          if (!next || next.timestamp < lastTimestampRef.current) return;
          lastTimestampRef.current = next.timestamp;
          if (!active) return;
          setFix(next);
          setLastFixAt(Date.now());
        },
        onClose(statusCode) {
          finish(statusCode);
        },
        onError() {
          if (!active || gen !== generation || ended || errorStop) return;
          if (settled) {
            if (closedStatus == null || closedStatus === 0 || closedStatus === 200) updateKind('offline');
            return;
          }
          finish(0);
        },
      });

      if (settled || !active || gen !== generation || suspended || ended || errorStop) {
        close();
        return;
      }
      closeRef.current = close;
      armIdle();
    }

    updateStatus('connecting');
    if (!suspended) openConnection();

    const subscription = AppState.addEventListener('change', next => {
      if (next === 'background') {
        if (suspended) return;
        suspended = true;
        generation += 1;
        clearIdle();
        clearRetry();
        stopSocket();
        if (phase === 'live') updateStatus('reconnecting');
        return;
      }
      if (next !== 'active' || !suspended) return;
      suspended = false;
      if (!active || ended || errorStop) return;
      if (phase === 'live') updateStatus('reconnecting');
      if (refreshFlight) {
        refreshFlight.then(ok => {
          if (!active || suspended || ended || errorStop) return;
          if (!ok) {
            fail('session');
            return;
          }
          openConnection();
        });
        return;
      }
      openConnection();
    });

    return () => {
      active = false;
      ended = true;
      generation += 1;
      clearIdle();
      clearRetry();
      stopSocket();
      subscription?.remove();
    };
  }, [busId, enabled]);

  return { status, errorKind, fix, lastFixAt };
}
