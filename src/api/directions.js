import { MAPBOX_PUBLIC_TOKEN } from '../config';

function chunk(points, max = 25) {
  if (points.length <= max) return [points];
  const chunks = [];
  let start = 0;
  while (start < points.length - 1) {
    const end = Math.min(start + max, points.length);
    chunks.push(points.slice(start, end));
    start = end - 1;
  }
  return chunks;
}

function same(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

export async function getRoadPath(points) {
  if (points.length < 2) return [];
  try {
    const path = [];
    for (const part of chunk(points)) {
      const coordinates = part.map(point => `${point[0]},${point[1]}`).join(';');
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_PUBLIC_TOKEN}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      if (json.code !== 'Ok') return [];
      const coords = json.routes[0].geometry.coordinates;
      const stitch = path.length && coords.length && same(path[path.length - 1], coords[0]);
      path.push(...(stitch ? coords.slice(1) : coords));
    }
    return path;
  } catch {
    return [];
  }
}
