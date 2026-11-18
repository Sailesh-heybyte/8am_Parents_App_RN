import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Mapbox from '@rnmapbox/maps';
import { HouseIcon } from 'phosphor-react-native';
import { getChildRoute } from '../../api/children';
import { getRoadPath } from '../../api/directions';
import AppMapView from '../../components/AppMapView';
import AppText from '../../components/AppText';
import BackButton from '../../components/BackButton';
import Card from '../../components/Card';
import { useLanguage } from '../../context/LanguageContext';
import { startBusSimulator } from '../../utils/busSimulator';
import { getErrorMessage } from '../../utils/errors';
import { buildRoute, snapToRoute } from '../../utils/routeMath';
import { colors } from '../../styles';
import LiveBusLayer from './LiveBusLayer';
import styles from './TrackBus.styles';

const HYDERABAD = [78.4867, 17.3850];

const PASSED_LAG_M = 20;

const stopStyle = {
  circleRadius: ['case', ['==', ['get', 'kind'], 'child'], 9, 7],
  circleColor: [
    'case',
    ['get', 'passed'], '#64748B',
    ['==', ['get', 'kind'], 'start'], '#10B981',
    ['==', ['get', 'kind'], 'destination'], '#E11D48',
    ['==', ['get', 'kind'], 'child'], colors.primaryNavy,
    '#FFFFFF',
  ],
  circleStrokeWidth: 2.5,
  circleStrokeColor: [
    'case',
    ['all', ['==', ['get', 'kind'], 'stop'], ['!', ['get', 'passed']]],
    colors.primaryNavy,
    '#FFFFFF',
  ],
};

function isPlaced(point) {
  return point[0] !== 0 || point[1] !== 0;
}

export default function TrackBus({ navigation, route: navRoute }) {
  const { child } = navRoute.params;
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const padding = width < 380 ? 16 : 20;
  const hasHome = child.homeLatitude != null && child.homeLongitude != null;
  const home = useMemo(
    () => (hasHome ? [child.homeLongitude, child.homeLatitude] : null),
    [hasHome, child.homeLongitude, child.homeLatitude],
  );
  const cameraRef = useRef(null);
  const fitted = useRef(false);
  const hasFixRef = useRef(false);
  const zoomRef = useRef(15.5);
  const busPointRef = useRef(null);
  const demoStopRef = useRef(null);
  const [route, setRoute] = useState(null);
  const [roadPath, setRoadPath] = useState([]);
  const [routeError, setRouteError] = useState('');
  const [pathReady, setPathReady] = useState(false);
  const [demoFix, setDemoFix] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [busDistance, setBusDistance] = useState(0);

  useEffect(() => {
    let active = true;
    getChildRoute(child.id)
      .then(async loaded => {
        if (!active) return;
        setRoute(loaded);
        const waypoints = [
          loaded.start,
          ...loaded.stops.map(stop => [stop.longitude, stop.latitude]),
          loaded.end,
        ].filter(isPlaced);
        const path = await getRoadPath(waypoints);
        if (!active) return;
        setRoadPath(path);
        setPathReady(true);
      })
      .catch(error => {
        if (!active) return;
        setRouteError(getErrorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [child.id]);

  const routeModel = useMemo(() => (roadPath.length >= 2 ? buildRoute(roadPath) : null), [roadPath]);
  const hasFix = demoFix != null;
  hasFixRef.current = hasFix;

  useEffect(() => () => {
    demoStopRef.current?.();
  }, []);

  const handlePassed = useCallback(distance => {
    setBusDistance(distance);
  }, []);

  function handleCameraChanged(state) {
    if (!hasFixRef.current || !state?.gestures?.isGestureActive) return;
    const zoom = state.properties?.zoom;
    if (typeof zoom !== 'number') return;
    zoomRef.current = Math.min(18, Math.max(11, zoom));
  }

  function toggleDemo() {
    if (!__DEV__) return;
    if (demoStopRef.current) {
      demoStopRef.current();
      demoStopRef.current = null;
      setDemoRunning(false);
      return;
    }
    demoStopRef.current = startBusSimulator(roadPath, setDemoFix);
    setDemoRunning(true);
  }

  useEffect(() => {
    if (hasFixRef.current) {
      fitted.current = true;
      return;
    }
    if (!pathReady || !route || fitted.current || !cameraRef.current) return;
    const points = roadPath.length >= 2
      ? [...roadPath]
      : [route.start, route.end, ...route.stops.map(stop => [stop.longitude, stop.latitude])].filter(isPlaced);
    if (home) points.push(home);
    if (points.length === 0) return;

    let minLng = points[0][0];
    let maxLng = points[0][0];
    let minLat = points[0][1];
    let maxLat = points[0][1];
    points.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });
    fitted.current = true;
    cameraRef.current.fitBounds(
      [maxLng, maxLat],
      [minLng, minLat],
      [insets.top + 90, 40, 200 + insets.bottom, 40],
      800,
    );
  }, [pathReady, route, roadPath, home, insets.top, insets.bottom]);

  const markers = useMemo(() => {
    if (!route) return [];
    const items = [];
    if (isPlaced(route.start)) items.push({ kind: 'start', point: route.start });
    route.stops.forEach(stop => {
      const point = [stop.longitude, stop.latitude];
      if (!isPlaced(point)) return;
      items.push({ kind: stop.id === child.stopId ? 'child' : 'stop', point });
    });
    if (isPlaced(route.end)) items.push({ kind: 'destination', point: route.end });
    if (!routeModel) return items.map(item => ({ ...item, distance: Infinity }));
    return items.map(item => ({
      ...item,
      distance: snapToRoute(routeModel, item.point).distance,
    }));
  }, [route, routeModel, child.stopId]);

  const gates = useMemo(
    () => markers.filter(marker => Number.isFinite(marker.distance)).map(marker => marker.distance),
    [markers],
  );

  const passedKey = hasFix
    ? markers.map(marker => (marker.distance < busDistance - PASSED_LAG_M ? '1' : '0')).join('')
    : '';

  const stopsShape = useMemo(() => ({
    type: 'FeatureCollection',
    features: markers.map((marker, index) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: marker.point },
      properties: { kind: marker.kind, passed: passedKey[index] === '1' },
    })),
  }), [markers, passedKey]);

  const stopIndex = route && child.stopId ? route.stops.findIndex(stop => stop.id === child.stopId) : -1;
  const childStop = stopIndex >= 0 ? route.stops[stopIndex] : null;

  let subtitle = hasHome ? t('homeLocationSetLabel') : t('homeLocationNotSet');
  let subtitleColor = colors.textSecondary;
  if (routeError) {
    subtitle = routeError;
    subtitleColor = colors.errorRed;
  } else if (childStop) {
    subtitle = `${childStop.name} · ${t('stopXOfY', {
      stopSequence: stopIndex + 1,
      totalStops: route.stops.length,
    })}`;
  }

  return (
    <View style={styles.screen}>
      <AppMapView
        style={StyleSheet.absoluteFill}
        scrollEnabled={!hasFix}
        rotateEnabled={false}
        pitchEnabled={false}
        onCameraChanged={handleCameraChanged}
      >
        <Mapbox.Camera
          ref={cameraRef}
          minZoomLevel={hasFix ? 11 : 0}
          maxZoomLevel={hasFix ? 18 : 22}
          defaultSettings={{
            centerCoordinate: home || HYDERABAD,
            zoomLevel: home ? 15 : 10,
            animationDuration: 0,
          }}
        />
        {routeModel ? (
          <LiveBusLayer
            route={routeModel}
            fix={demoFix}
            gates={gates}
            cameraRef={cameraRef}
            zoomRef={zoomRef}
            busPointRef={busPointRef}
            onPassed={handlePassed}
          />
        ) : null}
        {markers.length > 0 ? (
          <Mapbox.ShapeSource id="stops" shape={stopsShape}>
            <Mapbox.CircleLayer
              id="stopDots"
              aboveLayerID={routeModel ? 'routeAhead' : undefined}
              style={stopStyle}
            />
          </Mapbox.ShapeSource>
        ) : null}
        {home ? (
          <Mapbox.MarkerView coordinate={home} allowOverlap>
            <View style={styles.marker}>
              <HouseIcon weight="fill" size={20} color={colors.primaryNavy} />
            </View>
          </Mapbox.MarkerView>
        ) : null}
      </AppMapView>

      <View style={[styles.header, { top: insets.top + 12, left: padding, right: padding }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.pill}>
          <AppText variant="heading3" color={colors.primaryNavy} numberOfLines={1} style={styles.pillText}>
            {child.name}
          </AppText>
        </View>
      </View>

      {__DEV__ && routeModel ? (
        <Pressable
          accessibilityRole="button"
          onPress={toggleDemo}
          style={[styles.demo, { top: insets.top + 62, right: padding }]}
        >
          <AppText color={colors.primaryNavy} style={styles.demoText}>
            {demoRunning ? 'Stop demo' : 'Demo bus'}
          </AppText>
        </Pressable>
      ) : null}

      <View style={[styles.bottom, { left: padding, right: padding, bottom: insets.bottom + 16 }]}>
        <Card>
          <AppText color={colors.textPrimary} style={styles.title}>
            {route?.routeName || t('liveBusTracking')}
          </AppText>
          <AppText variant="bodySecondary" color={subtitleColor} style={styles.subtitle}>
            {subtitle}
          </AppText>
        </Card>
      </View>
    </View>
  );
}
