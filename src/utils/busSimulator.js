import { buildRoute, distanceMeters, pointAtDistance } from './routeMath';

const METRES_PER_DEGREE = 111320;

function withNoise(point, metres) {
  const north = (Math.random() * 2 - 1) * metres;
  const east = (Math.random() * 2 - 1) * metres;
  const lat = point[1] + north / METRES_PER_DEGREE;
  const lng = point[0] + east / (METRES_PER_DEGREE * Math.cos((point[1] * Math.PI) / 180));
  return [lng, lat];
}

export function startBusSimulator(path, onFix, { intervalMs = 2500, stepMeters } = {}) {
  const route = buildRoute(path);
  const total = route.total || 0;
  const hops = Math.max(12, Math.round(70000 / intervalMs));
  const step = stepMeters ?? Math.max(40, total / hops);
  const returnsHome = path.length >= 2 && distanceMeters(path[0], path[path.length - 1]) < 80;
  let distance = 0;
  let towardEnd = true;
  let timer = null;

  function emit() {
    onFix({
      point: withNoise(pointAtDistance(route, distance).point, 8),
      distance,
      timestamp: Date.now(),
    });
  }

  function stop() {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
  }

  emit();
  timer = setInterval(() => {
    if (towardEnd) {
      distance = Math.min(total, distance + step);
      emit();
      if (distance >= total) {
        if (returnsHome) stop();
        else towardEnd = false;
      }
      return;
    }
    distance = Math.max(0, distance - step);
    emit();
    if (distance <= 0) stop();
  }, intervalMs);

  return stop;
}
