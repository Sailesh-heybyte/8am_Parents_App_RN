// The live bus on the map: route line (grey = done, blue = ahead), stops,
// bus icon, amber pulse and the child's initial.
// The movement itself comes from the Flutter engine (tripTrackingController):
// we give it GPS fixes, call tick() every frame, and draw what it says.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { createRoute } from '../../utils/routeGeometry';
import { createTripTracking } from '../../utils/tripTrackingController';
import { colors } from '../../styles';

const busImage = require('../../assets/images/bus.png');

const FOLLOW_ZOOM = 15.5;
const PULSE_MS = 1200;

// ── Map styles (same values as the Flutter app) ──────────────────────────
const round = { lineCap: 'round', lineJoin: 'round' };
const casingStyle = { ...round, lineColor: '#FFFFFF', lineWidth: 8.5 };
const doneStyle = { ...round, lineColor: '#64748B', lineWidth: 5.5 };
const aheadStyle = fraction => ({ ...round, lineColor: '#0284C7', lineWidth: 5.5, lineTrimOffset: [0, fraction] });

const busStyle = heading => ({
  iconImage: 'bus',
  iconRotate: heading,
  iconRotationAlignment: 'map',
  iconAllowOverlap: true,
  iconIgnorePlacement: true,
});

// Two amber rings that grow and fade out of phase. The map animates the
// change itself (transition), so JS only flips them every 1.2 s.
const ringTransition = { duration: PULSE_MS, delay: 0 };
const ringStyle = expanded => ({
  circleColor: '#F59E0B',
  circleStrokeColor: '#F59E0B',
  circleStrokeWidth: 1.5,
  circleRadius: expanded ? 38 : 18,
  circleOpacity: expanded ? 0 : 0.35,
  circleStrokeOpacity: expanded ? 0.15 : 0.8,
  circleRadiusTransition: ringTransition,
  circleOpacityTransition: ringTransition,
  circleStrokeOpacityTransition: ringTransition,
});

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

// Navy badge with the child's initial, above the bus, always upright.
const badgeStyle = {
  circleRadius: 11,
  circleColor: colors.primaryNavy,
  circleStrokeWidth: 2,
  circleStrokeColor: '#FFFFFF',
  circleTranslate: [0, -46],
  circleTranslateAnchor: 'viewport',
};
const badgeTextStyle = initial => ({
  textField: initial,
  textSize: 12,
  textColor: '#FFFFFF',
  textOffset: [0, -3.85],
  textRotationAlignment: 'viewport',
  textAllowOverlap: true,
  textIgnorePlacement: true,
});

const pointShape = coordinates => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'Point', coordinates },
});

export default function LiveBus({ roadPath, stops, stopsShape, fix, cameraRef, initial, onPassedStops }) {
  const route = useMemo(() => createRoute(roadPath), [roadPath]);
  const trip = useMemo(() => createTripTracking(route, stops), [route, stops]);

  const [firstPoint, setFirstPoint] = useState(null); // where the bus first appears
  const [ringsOut, setRingsOut] = useState(false);
  const [finished, setFinished] = useState(false);

  // Refs so each frame updates the map directly, without re-rendering React.
  const busRef = useRef(null);
  const busIconRef = useRef(null);
  const aheadRef = useRef(null);
  const frameRef = useRef(0);
  const passedRef = useRef(0);
  const touchingRef = useRef(false);
  const zoomRef = useRef(FOLLOW_ZOOM);
  const shownRef = useRef(false);

  // Draws one frame from the engine's current state.
  function draw() {
    const position = trip.position;
    if (!position) return;
    if (!shownRef.current) {
      shownRef.current = true;
      setFirstPoint(position);
    }

    busRef.current?.setNativeProps({ shape: pointShape(position) });
    busIconRef.current?.setNativeProps({ style: busStyle(trip.heading) });
    aheadRef.current?.setNativeProps({ style: aheadStyle(trip.fraction) });

    if (trip.passedStops !== passedRef.current) {
      passedRef.current = trip.passedStops;
      onPassedStops(trip.passedStops);
    }
    if (trip.status === 'completed') setFinished(true);

    // Follow the bus: centred, pointing up, no tilt (not while the user pinches).
    if (!touchingRef.current) {
      cameraRef.current?.setCamera({
        centerCoordinate: position,
        heading: trip.heading,
        zoomLevel: zoomRef.current,
        pitch: 0,
        animationDuration: 0,
      });
    }
  }

  // Runs tick() every frame until the engine says the bus has arrived.
  function startFrames() {
    if (frameRef.current) return;
    const step = () => {
      frameRef.current = 0;
      trip.tick();
      if (trip.isAnimating()) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  }

  // Draw whenever the engine changes; stop everything when we leave.
  useEffect(() => {
    const unsubscribe = trip.subscribe(draw);
    const appState = AppState.addEventListener('change', next => {
      if (next === 'active') trip.resync(); // next fix jumps straight to the bus
    });
    return () => {
      unsubscribe();
      appState.remove();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip]);

  // Every new GPS fix goes into the engine.
  useEffect(() => {
    if (fix && trip.onFix(fix)) startFrames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fix, trip]);

  // Pulse: flip the rings every 1.2 s while the trip runs.
  useEffect(() => {
    if (!firstPoint || finished) return undefined;
    const timer = setInterval(() => setRingsOut(out => !out), PULSE_MS);
    return () => clearInterval(timer);
  }, [firstPoint, finished]);

  // Pinch-zoom: keep the user's zoom; follow again shortly after they let go.
  function handleCameraChanged(event) {
    const state = event.nativeEvent;
    if (!state.properties?.isUserInteraction) return;
    touchingRef.current = true;
    zoomRef.current = Math.min(18, Math.max(11, state.properties.zoom));
  }
  function handleMapSteady() {
    if (!touchingRef.current) return;
    touchingRef.current = false;
    draw();
  }

  // Layer order: route → stops → rings → bus → badge.
  const below = stopsShape ? 'stopDots' : 'routeAhead';

  return (
    <>
      <Mapbox.CameraGestureObserver
        style={{ width: 0, height: 0 }}
        pointerEvents="none"
        quietPeriodMs={600}
        onCameraChanged={handleCameraChanged}
        onMapSteady={handleMapSteady}
      />
      <Mapbox.Images images={{ bus: busImage }} />

      {route.isUsable ? (
        <Mapbox.ShapeSource id="route" lineMetrics shape={{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.points } }}>
          <Mapbox.LineLayer id="routeCasing" style={casingStyle} />
          <Mapbox.LineLayer id="routeDone" aboveLayerID="routeCasing" style={doneStyle} />
          <Mapbox.LineLayer id="routeAhead" ref={aheadRef} aboveLayerID="routeDone" style={aheadStyle(0)} />
        </Mapbox.ShapeSource>
      ) : null}

      {stopsShape ? (
        <Mapbox.ShapeSource id="stops" shape={stopsShape}>
          <Mapbox.CircleLayer id="stopDots" aboveLayerID={route.isUsable ? 'routeAhead' : undefined} style={stopStyle} />
        </Mapbox.ShapeSource>
      ) : null}

      {firstPoint ? (
        <Mapbox.ShapeSource id="bus" ref={busRef} shape={pointShape(firstPoint)}>
          {finished ? null : <Mapbox.CircleLayer id="ringA" aboveLayerID={below} style={ringStyle(ringsOut)} />}
          {finished ? null : <Mapbox.CircleLayer id="ringB" aboveLayerID="ringA" style={ringStyle(!ringsOut)} />}
          <Mapbox.SymbolLayer id="busIcon" ref={busIconRef} aboveLayerID={finished ? below : 'ringB'} style={busStyle(trip.heading)} />
          {initial ? <Mapbox.CircleLayer id="badge" aboveLayerID="busIcon" style={badgeStyle} /> : null}
          {initial ? <Mapbox.SymbolLayer id="badgeText" aboveLayerID="badge" style={badgeTextStyle(initial)} /> : null}
        </Mapbox.ShapeSource>
      ) : null}
    </>
  );
}
