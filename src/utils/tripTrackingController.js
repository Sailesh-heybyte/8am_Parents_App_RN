// Port of the Flutter app's lib/ui/controllers/tracking/trip_tracking_controller.dart
// (same tuning constants, same rules). No React code.
//
// One animated value, `progress` (metres along the route), drives the bus
// marker, the done/ahead split and the camera. Each fix is snapped to the
// route inside a forward window and becomes the next animation target.
// Call tick() once per frame while isAnimating() is true; subscribe() is
// notified whenever the rendered frame changes.

import { bearingBetween, metresBetween } from './routeGeometry';

export const TripStatus = {
  waitingForFix: 'waitingForFix',
  live: 'live',
  offRoute: 'offRoute',
  completed: 'completed',
};

// Tuning (identical to Flutter).
const JITTER_M = 3;
const END_M = 30;
const STOP_PASSED_M = 15;
const BEHIND_M = 30;
const MAX_BUS_SPEED = 40; // m/s, bounds the forward search window
const SNAP_AFTER_GAP_MS = 20000;
const HEADING_TAU = 0.3; // seconds

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Shortest signed rotation from `from` to `to`, in (-180, 180].
function headingDelta(from, to) {
  const d = (((to - from) % 360) + 360) % 360;
  return d > 180 ? d - 360 : d;
}

export function createTripTracking(route, stops = [], { offRouteMetres = 100, offRouteFixes = 3, onOffRoute } = {}) {
  const now = () => (global.performance?.now ? global.performance.now() : Date.now());
  const listeners = new Set();

  let status = TripStatus.waitingForFix;
  let passedStops = 0;

  let progress = 0;
  let target = 0;
  let animFrom = 0;
  let animStart = 0;
  let animDuration = 0; // ms
  let heading = 0;
  let targetHeading = 0;
  let lastTick = null;
  let raw = null;
  let offCount = 0;
  let snapNext = false;
  let lastFixTimestamp = null;
  let lastFixAt = null;
  let lastSnappedAt = null;
  let gapSeconds = 5;
  let gapRecentMax = 6.5; // backend sends ~5 s; allow 30% jitter at first
  let speed = null; // m/s along the route, smoothed

  // Metres along the route of each stop, in visiting order.
  const stopDistances = (() => {
    if (!route.isUsable) return [];
    const out = [];
    let from = 0;
    for (const s of stops) {
      if (!s.latitude && !s.longitude) { out.push(from); continue; }
      const p = route.project([s.longitude, s.latitude], { from });
      from = p ? p.distance : from;
      out.push(from);
    }
    return out;
  })();

  const notify = () => listeners.forEach(l => l());
  const followsRoute = () => route.isUsable && status !== TripStatus.offRoute;
  const setStatus = s => { if (status !== TripStatus.completed && status !== s) { status = s; } };

  function afterProgressChanged() {
    let passed = 0;
    while (passed < stopDistances.length && stopDistances[passed] <= progress + STOP_PASSED_M) passed++;
    passedStops = passed;
    if (progress >= route.length - END_M) setStatus(TripStatus.completed);
  }

  const api = {
    get progress() { return progress; },
    get heading() { return heading; },
    get status() { return status; },
    get passedStops() { return passedStops; },
    get stopDistances() { return stopDistances; },
    get hasFix() { return lastFixAt != null; },
    get position() {
      if (lastFixAt == null) return null;
      return followsRoute() ? route.pointAt(progress) : raw;
    },
    // 0..1 for the done/ahead split.
    get fraction() { return lastFixAt != null && route.length > 0 ? clamp(progress / route.length, 0, 1) : 0; },

    isAnimating() {
      if (lastFixAt == null || status === TripStatus.completed) return false;
      return progress < target || Math.abs(headingDelta(heading, targetHeading)) > 0.5;
    },

    // The next fix jumps straight to its position (used after app resume).
    resync() { snapNext = true; },

    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    // fix: { point: [lng, lat], timestamp: ms }. Returns whether it was accepted.
    onFix(fix) {
      if (status === TripStatus.completed) return false;
      const [lng, lat] = fix.point || [];
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
      if (lat === 0 && lng === 0) return false;
      if (lastFixTimestamp != null && fix.timestamp < lastFixTimestamp) return false;
      // Equal timestamps still count when the position moved.
      if (fix.timestamp === lastFixTimestamp && raw && raw[0] === lng && raw[1] === lat) return false;

      const t = now();
      const sinceLast = lastFixAt == null ? null : t - lastFixAt;
      lastFixTimestamp = fix.timestamp;
      lastFixAt = t;
      if (sinceLast != null && sinceLast < SNAP_AFTER_GAP_MS) {
        const s = sinceLast / 1000;
        gapSeconds = clamp(gapSeconds * 0.7 + s * 0.3, 1, 15);
        // Decays towards the mean, so one slow fix doesn't slow the bus forever.
        gapRecentMax = Math.min(15, Math.max(s, gapRecentMax * 0.97 + gapSeconds * 0.03));
      }

      const previousRaw = raw;
      const point = [lng, lat];
      raw = point;

      if (!route.isUsable) {
        if (previousRaw && metresBetween(previousRaw, point) > 5) targetHeading = bearingBetween(previousRaw, point);
        setStatus(TripStatus.live);
        notify();
        return true;
      }

      // The window grows with time since the last on-route fix.
      const sinceSnap = lastSnappedAt == null ? null : t - lastSnappedAt;
      const first = sinceSnap == null;
      const snap = first || snapNext || sinceSnap >= SNAP_AFTER_GAP_MS;
      const dtSnap = first ? 0 : sinceSnap / 1000;
      const proj = route.project(point, {
        from: first ? null : target,
        ahead: snapNext ? Infinity : Math.max(500, MAX_BUS_SPEED * dtSnap),
        behind: BEHIND_M,
        // Biased low: a wrong jump ahead can never be undone.
        expected: first ? null : target + 0.5 * (speed ?? 0) * dtSnap,
      });

      if (proj == null || proj.offset > offRouteMetres) {
        offCount++;
        if (offCount >= offRouteFixes) {
          if (status !== TripStatus.offRoute) {
            setStatus(TripStatus.offRoute);
            onOffRoute?.();
          }
          if (previousRaw && metresBetween(previousRaw, point) > 5) targetHeading = bearingBetween(previousRaw, point);
          notify();
        }
        // A lone outlier is ignored; the bus keeps animating to its target.
        return true;
      }

      offCount = 0;
      snapNext = false;
      lastSnappedAt = t;
      setStatus(TripStatus.live);

      // Never move backwards, and hold still through GPS jitter at a stop.
      const next = proj.distance;
      if (!first && dtSnap > 0) {
        const v = clamp((next - target) / dtSnap, 0, MAX_BUS_SPEED);
        speed = speed == null ? v : speed * 0.6 + v * 0.4;
      }
      if (snap) {
        target = Math.max(next, first ? next : target);
        progress = target;
        animFrom = progress;
        animDuration = 0;
        targetHeading = route.bearingAt(progress);
        if (first) heading = targetHeading;
        lastTick = null;
        afterProgressChanged();
        notify();
      } else if (next > target + JITTER_M) {
        target = next;
        animFrom = progress;
        animStart = t;
        // Longer than the recent slowest gap, so the bus is still moving when
        // a late fix lands, instead of freezing at the target.
        animDuration = Math.max(gapSeconds * 1.15, gapRecentMax * 1.1) * 1000;
      }
      return true;
    },

    // Advances the animation to the current clock time.
    tick() {
      if (lastFixAt == null) return;
      const t = now();
      const dt = lastTick == null ? 0 : (t - lastTick) / 1000;
      lastTick = t;
      let changed = false;

      if (followsRoute() && progress < target) {
        const k = animDuration <= 0 ? 1 : clamp((t - animStart) / animDuration, 0, 1);
        // Linear: constant speed between fixes, no pulsing.
        progress = animFrom + (target - animFrom) * k;
        targetHeading = route.bearingAt(progress);
        afterProgressChanged();
        changed = true;
      }

      const delta = headingDelta(heading, targetHeading);
      if (Math.abs(delta) > 0.5) {
        const k = dt <= 0 ? 0 : 1 - Math.exp(-dt / HEADING_TAU);
        heading = (heading + delta * k + 360) % 360;
        changed = true;
      } else if (delta !== 0) {
        heading = targetHeading;
        changed = true;
      }
      if (changed) notify();
    },
  };
  return api;
}
