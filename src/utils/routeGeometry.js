// Port of the Flutter app's lib/core/utils/route_geometry.dart (1:1 logic).
// A polyline measured in metres along its length. Points are [lng, lat].
// Uses a local equirectangular approximation (accurate to well under 0.1%
// at road-segment lengths), exactly like the Flutter version.

const EARTH_RADIUS = 6371008.8;
const DEG = Math.PI / 180;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function metresBetween(a, b) {
  const cosLat = Math.cos(((a[1] + b[1]) / 2) * DEG);
  const dx = (b[0] - a[0]) * DEG * cosLat * EARTH_RADIUS;
  const dy = (b[1] - a[1]) * DEG * EARTH_RADIUS;
  return Math.sqrt(dx * dx + dy * dy);
}

// Compass bearing (0 = north, clockwise) from a to b, in degrees.
// Self-check: bearingBetween([0,0],[0,1]) = 0 (north); ([0,0],[1,0]) = 90 (east).
export function bearingBetween(a, b) {
  const cosLat = Math.cos(((a[1] + b[1]) / 2) * DEG);
  const dx = (b[0] - a[0]) * cosLat;
  const dy = b[1] - a[1];
  return ((Math.atan2(dx, dy) / DEG) + 360) % 360;
}

export function createRoute(raw) {
  const points = [];
  for (const p of raw || []) {
    if (!Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
    const last = points[points.length - 1];
    // Zero-length segments break bearing and projection maths.
    if (last && last[0] === p[0] && last[1] === p[1]) continue;
    points.push(p);
  }
  const cumulative = new Array(points.length).fill(0);
  for (let i = 1; i < points.length; i++) {
    cumulative[i] = cumulative[i - 1] + metresBetween(points[i - 1], points[i]);
  }
  const length = cumulative.length ? cumulative[cumulative.length - 1] : 0;
  const isUsable = points.length >= 2;

  // Index i of the segment points[i] -> points[i+1] containing d.
  function segmentIndexAt(d) {
    if (points.length < 2 || d <= 0) return 0;
    if (d >= length) return points.length - 2;
    let lo = 0;
    let hi = points.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] <= d) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  function pointAt(d) {
    if (points.length === 1) return points[0];
    const i = segmentIndexAt(d);
    const segLen = cumulative[i + 1] - cumulative[i];
    const t = clamp((d - cumulative[i]) / segLen, 0, 1);
    const a = points[i];
    const b = points[i + 1];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  // Bearing of the segment under d.
  function bearingAt(d) {
    if (points.length < 2) return 0;
    const i = segmentIndexAt(d);
    return bearingBetween(points[i], points[i + 1]);
  }

  // Snaps p to the route. With `from`, only segments overlapping
  // [from - behind, from + ahead] are considered (no jumping to the opposite
  // leg on a U-turn). Near-ties (within tieTolerance metres) are resolved by
  // closeness to `expected`, else the earliest wins.
  function project(p, { from = null, ahead = Infinity, behind = 0, expected = null, tieTolerance = 20 } = {}) {
    if (points.length < 2) return null;
    const lo = from == null ? 0 : from - behind;
    const hi = from == null ? Infinity : from + ahead;
    const cosLat = Math.cos(p[1] * DEG);
    const toX = q => (q[0] - p[0]) * DEG * cosLat * EARTH_RADIUS;
    const toY = q => (q[1] - p[1]) * DEG * EARTH_RADIUS;

    const candidates = [];
    let best = Infinity;
    for (let i = segmentIndexAt(lo); i < points.length - 1; i++) {
      if (cumulative[i] > hi) break;
      const ax = toX(points[i]);
      const ay = toY(points[i]);
      const bx = toX(points[i + 1]);
      const by = toY(points[i + 1]);
      const vx = bx - ax;
      const vy = by - ay;
      const len2 = vx * vx + vy * vy;
      // Raw point is the origin, so the projection parameter is -a·v / |v|².
      let t = len2 === 0 ? 0 : clamp(-(ax * vx + ay * vy) / len2, 0, 1);
      let d = cumulative[i] + t * (cumulative[i + 1] - cumulative[i]);
      // Keep the snapped distance inside the search window.
      if (d < lo || d > hi) {
        d = clamp(d, lo, hi);
        const segLen = cumulative[i + 1] - cumulative[i];
        t = segLen === 0 ? 0 : clamp((d - cumulative[i]) / segLen, 0, 1);
      }
      const px = ax + vx * t;
      const py = ay + vy * t;
      const offset = Math.sqrt(px * px + py * py);
      candidates.push({ distance: d, offset });
      if (offset < best) best = offset;
    }
    if (!candidates.length) return null;
    const score = c => (expected == null ? c.distance : Math.abs(c.distance - expected) + 2 * c.offset);
    let pick = null;
    for (const c of candidates) {
      if (c.offset <= best + tieTolerance && (pick == null || score(c) < score(pick))) pick = c;
    }
    return pick;
  }

  return { points, cumulative, length, isUsable, segmentIndexAt, pointAt, bearingAt, project };
}
