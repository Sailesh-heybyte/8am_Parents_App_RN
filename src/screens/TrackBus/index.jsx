import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Mapbox from '@rnmapbox/maps';
import { HouseIcon } from 'phosphor-react-native';
import { getChildRoute } from '../../api/children';
import { getRoadPath } from '../../api/directions';
import { connectBusTracking } from '../../api/tracking';
import AppMapView from '../../components/AppMapView';
import AppText from '../../components/AppText';
import BackButton from '../../components/BackButton';
import Card from '../../components/Card';
import { useLanguage } from '../../context/LanguageContext';
import { startBusSimulator } from '../../utils/busSimulator';
import { getErrorMessage } from '../../utils/errors';
import { colors } from '../../styles';
import LiveBus from './LiveBus';
import styles from './TrackBus.styles';

const HYDERABAD = [78.4867, 17.385];

// [0, 0] means the school hasn't placed that point yet.
const isPlaced = point => point[0] !== 0 || point[1] !== 0;

function stopFeature(kind, point, passed) {
  return { type: 'Feature', properties: { kind, passed }, geometry: { type: 'Point', coordinates: point } };
}

// Camera box around all points (zoomed out to show the whole route).
function fitToPoints(camera, points, insets) {
  if (!camera || points.length === 0) return;
  const lngs = points.map(p => p[0]);
  const lats = points.map(p => p[1]);
  camera.fitBounds(
    [Math.max(...lngs), Math.max(...lats)],
    [Math.min(...lngs), Math.min(...lats)],
    [insets.top + 90, 40, 200 + insets.bottom, 40],
    800,
  );
}

export default function TrackBus({ navigation, route: navRoute }) {
  const { child } = navRoute.params;
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const padding = width < 380 ? 16 : 20;
  const cameraRef = useRef(null);
  const stopDemoRef = useRef(null);

  const home = child.homeLatitude != null ? [child.homeLongitude, child.homeLatitude] : null;
  const initial = (child.name || '').trim().charAt(0).toUpperCase();

  const [route, setRoute] = useState(null);
  const [roadPath, setRoadPath] = useState([]);
  const [routeError, setRouteError] = useState('');
  const [liveFix, setLiveFix] = useState(null);
  const [demoFix, setDemoFix] = useState(null);
  const [status, setStatus] = useState(child.busId ? 'connecting' : 'noBus');
  const [passedStops, setPassedStops] = useState(0);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  const fix = demoFix ?? liveFix; // one GPS reading: { point, timestamp }
  const demoOn = demoFix != null;

  // 1) Load the route, then the road line that follows its stops.
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const loaded = await getChildRoute(child.id);
        if (!active) return;
        setRoute(loaded);
        const waypoints = [loaded.start, ...loaded.stops.map(s => [s.longitude, s.latitude]), loaded.end].filter(isPlaced);
        const path = await getRoadPath(waypoints);
        if (!active) return;
        setRoadPath(path);
        const box = path.length ? path : waypoints;
        fitToPoints(cameraRef.current, home ? [...box, home] : box, insets);
      } catch (e) {
        if (active) setRouteError(getErrorMessage(e));
      }
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  // 2) Live bus stream: only while the app is open and the demo is off.
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => setAppActive(state === 'active'));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!child.busId || demoOn || !appActive) return undefined;
    return connectBusTracking(child.busId, { onLocation: setLiveFix, onStatus: setStatus });
  }, [child.busId, demoOn, appActive]);

  // 3) Dev-only demo bus that drives along the real route.
  function toggleDemo() {
    if (stopDemoRef.current) {
      stopDemoRef.current();
      stopDemoRef.current = null;
      setDemoFix(null);
      return;
    }
    stopDemoRef.current = startBusSimulator(roadPath, setDemoFix);
  }
  useEffect(() => () => stopDemoRef.current?.(), []);

  // Stops for the map: start, each stop (grey once passed), school.
  const stopsShape = useMemo(() => {
    if (!route) return null;
    const features = [];
    if (isPlaced(route.start)) features.push(stopFeature('start', route.start, false));
    route.stops.forEach((stop, index) => {
      const point = [stop.longitude, stop.latitude];
      if (isPlaced(point)) features.push(stopFeature(stop.id === child.stopId ? 'child' : 'stop', point, index < passedStops));
    });
    if (isPlaced(route.end)) features.push(stopFeature('destination', route.end, false));
    return features.length ? { type: 'FeatureCollection', features } : null;
  }, [route, child.stopId, passedStops]);

  // Card subtitle: "Pantaloons · Stop #5 of 5"
  const stopIndex = route ? route.stops.findIndex(stop => stop.id === child.stopId) : -1;
  let subtitle = home ? t('homeLocationSetLabel') : t('homeLocationNotSet');
  if (stopIndex >= 0) {
    subtitle = `${route.stops[stopIndex].name} · ${t('stopXOfY', { stopSequence: stopIndex + 1, totalStops: route.stops.length })}`;
  }

  return (
    <View style={styles.screen}>
      <AppMapView
        style={StyleSheet.absoluteFill}
        scrollEnabled={!fix}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Mapbox.Camera ref={cameraRef} defaultSettings={{ centerCoordinate: home || HYDERABAD, zoomLevel: 14.5 }} />

        {roadPath.length >= 2 && route ? (
          <LiveBus
            key={demoOn ? 'demo' : 'live'}
            roadPath={roadPath}
            stops={route.stops}
            stopsShape={stopsShape}
            fix={fix}
            cameraRef={cameraRef}
            initial={initial}
            onPassedStops={setPassedStops}
          />
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

      {__DEV__ && roadPath.length >= 2 ? (
        <Pressable onPress={toggleDemo} accessibilityRole="button" style={[styles.demo, { top: insets.top + 62, right: padding }]}>
          <AppText color={colors.primaryNavy} style={styles.demoText}>
            {demoOn ? 'Stop demo' : 'Demo bus'}
          </AppText>
        </Pressable>
      ) : null}

      <View style={[styles.bottom, { left: padding, right: padding, bottom: insets.bottom + 16 }]}>
        <Card>
          <AppText color={colors.textPrimary} style={styles.title}>
            {route?.routeName || t('liveBusTracking')}
          </AppText>
          <AppText variant="bodySecondary" color={routeError ? colors.errorRed : colors.textSecondary} style={styles.subtitle}>
            {routeError || subtitle}
          </AppText>
          <StatusLine status={demoOn ? 'live' : status} />
        </Card>
      </View>
    </View>
  );
}

// "● LIVE", "Connecting…", "Trip ended", …
function StatusLine({ status }) {
  const { t } = useLanguage();
  if (status === 'live') {
    return (
      <View style={styles.statusRow}>
        <View style={styles.liveDot} />
        <AppText color={colors.liveGreen} style={styles.liveLabel}>{t('live')}</AppText>
      </View>
    );
  }
  if (status === 'connecting' || status === 'reconnecting') {
    return (
      <View style={styles.statusRow}>
        <ActivityIndicator size="small" color={colors.primaryNavy} />
        <AppText color={colors.textSecondary} style={styles.statusText}>
          {status === 'connecting' ? t('trackingConnecting') : t('trackingReconnecting')}
        </AppText>
      </View>
    );
  }
  const messages = {
    ended: t('trackingTripEndedTitle'),
    noBus: t('trackingNoBusTitle'),
    noAccess: t('trackingNoAccessTitle'),
    signedOut: t('trackingSignInAgain'),
  };
  const isError = status === 'noAccess' || status === 'signedOut';
  return (
    <View style={styles.statusRow}>
      <AppText color={isError ? colors.errorRed : colors.textSecondary} style={styles.statusText}>
        {messages[status] || ''}
      </AppText>
    </View>
  );
}
