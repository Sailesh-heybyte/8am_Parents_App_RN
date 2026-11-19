import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
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
import useBusTracking from '../../hooks/useBusTracking';
import { startBusSimulator } from '../../utils/busSimulator';
import { getErrorMessage } from '../../utils/errors';
import { buildRoute, snapToRoute } from '../../utils/routeMath';
import { colors } from '../../styles';
import LiveBusLayer, { followAnchor } from './LiveBusLayer';
import styles from './TrackBus.styles';

const HYDERABAD = [78.4867, 17.3850];
const PASSED_LAG_M = 20;
const PUCK = 160;
const busImage = require('../../assets/images/bus.png');

function buildFollowPadding(height, bottomInset) {
  const safeHeight = height > 0 ? height : 720;
  const bottom = Math.round(bottomInset + 128);
  const top = Math.round(bottom + safeHeight * 0.18);
  return {
    paddingTop: top,
    paddingRight: 40,
    paddingBottom: bottom,
    paddingLeft: 40,
  };
}

function pulseStyle(value) {
  return {
    opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
    transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1.45] }) }],
  };
}

function FollowPuck({ x, y }) {
  const first = useRef(new Animated.Value(0)).current;
  const second = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (value, delay) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    const leading = pulse(first, 0);
    const trailing = pulse(second, 800);
    leading.start();
    trailing.start();
    return () => {
      leading.stop();
      trailing.stop();
    };
  }, [first, second]);

  return (
    <View pointerEvents="none" style={[styles.puck, { left: x - PUCK / 2, top: y - PUCK / 2 }]}>
      <Animated.View style={[styles.ring, pulseStyle(first)]} />
      <Animated.View style={[styles.ring, pulseStyle(second)]} />
      <Image source={busImage} style={styles.busIcon} />
    </View>
  );
}

const stopStyle = {
  circleRadius: ['case', ['==', ['get', 'kind'], 'child'], 9, 7],
  circleColor: [
    'case',
    ['get', 'passed'], colors.mapRoutePassed,
    ['==', ['get', 'kind'], 'start'], colors.mapStopStart,
    ['==', ['get', 'kind'], 'destination'], colors.mapStopDestination,
    ['==', ['get', 'kind'], 'child'], colors.primaryNavy,
    colors.surfaceWhite,
  ],
  circleStrokeWidth: 2.5,
  circleStrokeColor: [
    'case',
    ['all', ['==', ['get', 'kind'], 'stop'], ['!', ['get', 'passed']]],
    colors.primaryNavy,
    colors.surfaceWhite,
  ],
};

function isPlaced(point) {
  return point[0] !== 0 || point[1] !== 0;
}

function TrackingStatus({ status, errorKind, hasBus }) {
  const { t } = useLanguage();
  if (status === 'live') {
    return (
      <View style={styles.statusRow}>
        <View style={styles.liveDot} />
        <AppText variant="bodySmall" color={colors.liveGreen} style={styles.liveLabel}>
          {t('live')}
        </AppText>
      </View>
    );
  }
  if (status === 'connecting' || status === 'reconnecting') {
    return (
      <View style={styles.statusRow}>
        <ActivityIndicator size="small" color={colors.primaryNavy} />
        <AppText variant="bodySmall" color={colors.textSecondary} style={styles.statusText}>
          {status === 'connecting' ? 'Connecting…' : 'Reconnecting…'}
        </AppText>
      </View>
    );
  }
  if (status === 'ended') {
    return (
      <View style={styles.statusRow}>
        <AppText variant="bodySmall" color={colors.textSecondary} style={styles.endedLabel}>
          {t('trackingTripEndedTitle')}
        </AppText>
      </View>
    );
  }
  if (status === 'error') {
    let message = t('trackingServerTitle');
    if (errorKind === 'noAccess') message = t('trackingNoAccessTitle');
    else if (errorKind === 'session') message = 'Please sign in again';
    return (
      <View style={styles.statusRow}>
        <AppText variant="bodySmall" color={colors.errorRed} style={styles.statusText}>
          {message}
        </AppText>
      </View>
    );
  }
  if (status === 'idle' && !hasBus) {
    return (
      <View style={styles.statusRow}>
        <AppText variant="bodySmall" color={colors.textSecondary} style={styles.endedLabel}>
          {t('trackingNoBusTitle')}
        </AppText>
      </View>
    );
  }
  return null;
}

export default function TrackBus({ navigation, route: navRoute }) {
  const { child } = navRoute.params;
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const padding = width < 380 ? 16 : 20;
  const [mapBox, setMapBox] = useState({ width: 0, height: 0 });
  const hasHome = child.homeLatitude != null && child.homeLongitude != null;
  const home = useMemo(
    () => (hasHome ? [child.homeLongitude, child.homeLatitude] : null),
    [hasHome, child.homeLongitude, child.homeLatitude],
  );
  const cameraRef = useRef(null);
  const fitted = useRef(false);
  const hasFixRef = useRef(false);
  const zoomRef = useRef(16);
  const busPointRef = useRef(null);
  const demoStopRef = useRef(null);
  const [route, setRoute] = useState(null);
  const [roadPath, setRoadPath] = useState([]);
  const [routeError, setRouteError] = useState('');
  const [pathReady, setPathReady] = useState(false);
  const [demoFix, setDemoFix] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [busDistance, setBusDistance] = useState(0);
  const { status, errorKind, fix: liveFix } = useBusTracking(child.busId, { enabled: !demoFix });

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
  const followPad = useMemo(
    () => buildFollowPadding(mapBox.height, insets.bottom),
    [mapBox.height, insets.bottom],
  );
  const anchor = useMemo(() => followAnchor(mapBox, followPad), [mapBox, followPad]);
  const fix = demoFix ?? liveFix;
  const hasFix = !!(demoFix ?? liveFix);
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

  function onScreenLayout(event) {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    setMapBox(current => (
      current.width === layoutWidth && current.height === layoutHeight
        ? current
        : { width: layoutWidth, height: layoutHeight }
    ));
  }

  return (
    <View style={styles.screen} onLayout={onScreenLayout}>
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
            fix={fix}
            gates={gates}
            cameraRef={cameraRef}
            zoomRef={zoomRef}
            busPointRef={busPointRef}
            padding={followPad}
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

      {hasFix && mapBox.width > 0 ? <FollowPuck x={anchor.x} y={anchor.y} /> : null}

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
          <TrackingStatus status={status} errorKind={errorKind} hasBus={!!child.busId} />
        </Card>
      </View>
    </View>
  );
}
