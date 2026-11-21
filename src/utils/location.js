// Mapbox wants [longitude, latitude]. The listener must always be removed,
// otherwise GPS keeps running and drains the battery.
import { PermissionsAndroid } from 'react-native';
import Mapbox from '@rnmapbox/maps';

const FINE = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
const COARSE = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
const FRESH_MS = 2 * 60 * 1000;

export async function requestLocationPermission() {
  const result = await PermissionsAndroid.requestMultiple([FINE, COARSE]);
  return (
    result[FINE] === PermissionsAndroid.RESULTS.GRANTED ||
    result[COARSE] === PermissionsAndroid.RESULTS.GRANTED
  );
}

function isFresh(location) {
  return (
    location?.coords != null &&
    location.timestamp != null &&
    Date.now() - location.timestamp < FRESH_MS
  );
}

function toLngLat(location) {
  return [location.coords.longitude, location.coords.latitude];
}

export async function getCurrentPosition(timeoutMs = 15000) {
  const last = await Mapbox.locationManager.getLastKnownLocation();
  if (isFresh(last)) return toLngLat(last);

  return new Promise((resolve, reject) => {
    let settled = false;

    function stop(settle) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      Mapbox.locationManager.removeListener(listener);
      settle();
    }

    function listener(location) {
      if (!location?.coords) return;
      if (last && location.timestamp != null && location.timestamp === last.timestamp) return;
      stop(() => resolve(toLngLat(location)));
    }

    const timer = setTimeout(() => {
      stop(() => reject(new Error('location-timeout')));
    }, timeoutMs);

    Mapbox.locationManager.addListener(listener);
  });
}
