// Coordinates are always [lng, lat].
const EARTH_RADIUS = 6371000;
const METRES_PER_DEGREE = 111320;

function radians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function distanceMeters(a, b) {
  const lat1 = radians(a[1]);
  const lat2 = radians(b[1]);
  const dLat = lat2 - lat1;
  const dLng = radians(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(h)));
}

// bearing([0,0],[0,1]) = 0 (north), bearing([0,0],[1,0]) = 90 (east).
export function bearing(a, b) {
  const toRad = d => d * Math.PI / 180;
  const toDeg = r => r * 180 / Math.PI;
  const φ1 = toRad(a[1]);
  const φ2 = toRad(b[1]);
  const Δλ = toRad(b[0] - a[0]);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function buildRoute(path) {
  const cum = [0];
  for (let i = 1; i < path.length; i += 1) {
    cum.push(cum[i - 1] + distanceMeters(path[i - 1], path[i]));
  }
  return { path, cum, total: cum[cum.length - 1] || 0 };
}

function totalOf(route) {
  return route.total || 0;
}

function segmentIndex(cum, distance) {
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi - 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (cum[mid] <= distance) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function snapToRoute(route, point, hint) {
  const { path, cum } = route;
  if (path.length === 0) return { distance: 0, offRoute: 0 };
  if (path.length === 1) return { distance: 0, offRoute: distanceMeters(path[0], point) };

  const cosLat = Math.cos(radians(point[1]));
  const toXY = p => [
    (p[0] - point[0]) * METRES_PER_DEGREE * cosLat,
    (p[1] - point[1]) * METRES_PER_DEGREE,
  ];

  let bestOff = Infinity;
  let bestDistance = 0;
  let nearOff = Infinity;
  let nearDistance = 0;
  let near = false;
  for (let i = 0; i < path.length - 1; i += 1) {
    const a = toXY(path[i]);
    const b = toXY(path[i + 1]);
    const abx = b[0] - a[0];
    const aby = b[1] - a[1];
    const len2 = abx * abx + aby * aby;
    let t = 0;
    if (len2 > 0) {
      t = Math.max(0, Math.min(1, (-a[0] * abx + -a[1] * aby) / len2));
    }
    const off = Math.hypot(a[0] + abx * t, a[1] + aby * t);
    const along = cum[i] + (cum[i + 1] - cum[i]) * t;
    if (off < bestOff) {
      bestOff = off;
      bestDistance = along;
    }
    // A route that returns to its depot is near both the start and the end.
    // Stay on the part of the line we are already travelling.
    if (hint != null && along >= hint - 40 && along <= hint + 400 && off < nearOff) {
      nearOff = off;
      nearDistance = along;
      near = true;
    }
  }
  if (near) return { distance: nearDistance, offRoute: nearOff };
  return { distance: bestDistance, offRoute: bestOff };
}

export function pointAtDistance(route, d) {
  const { path, cum } = route;
  const total = totalOf(route);
  const distance = Math.max(0, Math.min(total, d));
  if (path.length === 0) return { point: [0, 0], bearing: 0 };
  if (path.length === 1 || distance <= 0) {
    return { point: path[0], bearing: path.length > 1 ? bearingAlong(path, 0) : 0 };
  }
  if (distance >= total) {
    const last = path.length - 1;
    return { point: path[last], bearing: bearingAlong(path, last - 1) };
  }
  const index = segmentIndex(cum, distance);
  const span = cum[index + 1] - cum[index];
  const t = span === 0 ? 0 : (distance - cum[index]) / span;
  const a = path[index];
  const b = path[index + 1];
  return {
    point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
    bearing: bearingAlong(path, index),
  };
}

const MIN_BEARING_M = 8;

function bearingAlong(path, index) {
  for (let i = index; i < path.length - 1 && i < index + 12; i += 1) {
    if (distanceMeters(path[i], path[i + 1]) >= MIN_BEARING_M) return bearing(path[i], path[i + 1]);
  }
  for (let i = index - 1; i >= 0 && i > index - 12; i -= 1) {
    if (distanceMeters(path[i], path[i + 1]) >= MIN_BEARING_M) return bearing(path[i], path[i + 1]);
  }
  const next = Math.min(index + 1, path.length - 1);
  return next === index ? 0 : bearing(path[index], path[next]);
}
