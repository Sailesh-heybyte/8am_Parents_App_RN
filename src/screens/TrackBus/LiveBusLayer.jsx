import React, { useEffect, useMemo, useRef, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { pointAtDistance, snapToRoute } from '../../utils/routeMath';

const busImage = require('../../assets/images/bus.png');
const FRAME_MS = 33;
const ANIMATION_MS = 2500;
const OFF_ROUTE_M = 80;
const REVERSE_M = 25;
const JUMP_M = 800;
const PASSED_LAG_M = 20;
const MIN_ZOOM = 11;
const MAX_ZOOM = 18;

const casingStyle = {
  lineColor: '#FFFFFF',
  lineWidth: 8.5,
  lineCap: 'round',
  lineJoin: 'round',
};

const doneStyle = {
  lineColor: '#64748B',
  lineWidth: 5.5,
};

const RING_TRANSITION = { duration: 1200, delay: 0 };

const ringBase = {
  circleColor: '#F59E0B',
  circleStrokeColor: '#F59E0B',
  circleStrokeWidth: 1.5,
  circlePitchAlignment: 'map',
  circleRadiusTransition: RING_TRANSITION,
  circleOpacityTransition: RING_TRANSITION,
  circleStrokeOpacityTransition: RING_TRANSITION,
};

const ringExpanded = {
  ...ringBase,
  circleRadius: 38,
  circleOpacity: 0,
  circleStrokeOpacity: 0.15,
};

const ringCollapsed = {
  ...ringBase,
  circleRadius: 18,
  circleOpacity: 0.35,
  circleStrokeOpacity: 0.8,
};

const busStyle = {
  iconImage: 'bus',
  iconSize: 1.15,
  iconRotate: ['get', 'heading'],
  iconRotationAlignment: 'map',
  iconAllowOverlap: true,
  iconIgnorePlacement: true,
};

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function pointShape(coordinates, properties) {
  return { type: 'Feature', geometry: { type: 'Point', coordinates }, properties };
}

function passedSignature(distance, gates) {
  let signature = '';
  for (let i = 0; i < gates.length; i += 1) {
    signature += gates[i] < distance - PASSED_LAG_M ? '1' : '0';
  }
  return signature;
}

export default function LiveBusLayer({ route, fix, gates, cameraRef, zoomRef, busPointRef, onPassed }) {
  const displayedRef = useRef(0);
  const coveredRef = useRef(0);
  const bearingRef = useRef(0);
  const passedKeyRef = useRef(null);
  const gatesRef = useRef(gates);
  const onPassedRef = useRef(onPassed);
  const [visual, setVisual] = useState(null);
  const [pulseOut, setPulseOut] = useState(false);
  const live = fix != null;
  const routeRef = useRef(route);
  gatesRef.current = gates;
  onPassedRef.current = onPassed;
  if (routeRef.current !== route) {
    routeRef.current = route;
    displayedRef.current = 0;
    coveredRef.current = 0;
    bearingRef.current = 0;
    passedKeyRef.current = null;
  }

  const routeShape = useMemo(() => ({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: route.path },
  }), [route]);

  useEffect(() => {
    if (!route || !fix) return undefined;
    const snap = snapToRoute(route, fix.point, displayedRef.current);
    const guided = Number.isFinite(fix.distance);
    const total = route.total || 0;
    const target = guided ? Math.max(0, Math.min(total, fix.distance)) : snap.distance;
    const current = displayedRef.current;

    function follow(point, heading) {
      busPointRef.current = point;
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current));
      cameraRef.current?.setCamera({
        centerCoordinate: point,
        heading,
        zoomLevel: zoom,
        animationDuration: 0,
      });
    }

    function publish(distance) {
      const signature = passedSignature(distance, gatesRef.current);
      const previous = passedKeyRef.current || '';
      if (signature === previous) return;
      const gained = signature.split('').some((bit, index) => bit === '1' && previous[index] !== '1');
      passedKeyRef.current = signature;
      if (gained) onPassedRef.current?.(distance);
    }

    function place(distance, rawPoint) {
      const at = pointAtDistance(route, distance);
      let heading = rawPoint ? bearingRef.current : at.bearing;
      if (!rawPoint && distance < displayedRef.current - 1) heading = (heading + 180) % 360;
      const point = rawPoint || at.point;
      if (!rawPoint) {
        displayedRef.current = distance;
        bearingRef.current = heading;
        publish(distance);
      }
      coveredRef.current = Math.max(coveredRef.current, distance);
      const progress = total > 0 ? Math.min(1, coveredRef.current / total) : 0;
      setVisual({ point, heading, progress });
      follow(point, heading);
    }

    if (snap.offRoute > OFF_ROUTE_M && !guided) {
      place(current, fix.point);
      return undefined;
    }
    if (!guided && target < current - REVERSE_M) return undefined;

    if (!guided && Math.abs(target - current) > JUMP_M) {
      place(target, null);
      return undefined;
    }

    const from = current;
    let start = 0;
    let lastTick = 0;
    let raf = 0;
    let cancelled = false;

    function step(now) {
      if (cancelled) return;
      if (!start) start = now;
      if (lastTick && now - lastTick < FRAME_MS) {
        raf = requestAnimationFrame(step);
        return;
      }
      lastTick = now;
      const t = Math.min(1, (now - start) / ANIMATION_MS);
      place(from + (target - from) * easeInOut(t), null);
      if (t < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [route, fix, cameraRef, zoomRef, busPointRef]);

  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(() => setPulseOut(value => !value), 1200);
    return () => clearInterval(id);
  }, [live]);

  if (!route) return null;

  const progress = visual ? visual.progress : 0;
  const aheadStyle = {
    lineColor: '#0284C7',
    lineWidth: 5.5,
    lineTrimOffset: [0, progress],
  };

  return (
    <>
      <Mapbox.Images images={{ bus: busImage }} />
      <Mapbox.ShapeSource id="route" shape={routeShape} lineMetrics>
        <Mapbox.LineLayer id="routeCasing" style={casingStyle} />
        <Mapbox.LineLayer id="routeDone" aboveLayerID="routeCasing" style={doneStyle} />
        <Mapbox.LineLayer id="routeAhead" aboveLayerID="routeDone" style={aheadStyle} />
      </Mapbox.ShapeSource>
      {visual ? (
        <Mapbox.ShapeSource id="busPulse" shape={pointShape(visual.point)}>
          <Mapbox.CircleLayer id="pulseA" style={pulseOut ? ringExpanded : ringCollapsed} />
          <Mapbox.CircleLayer
            id="pulseB"
            aboveLayerID="pulseA"
            style={pulseOut ? ringCollapsed : ringExpanded}
          />
        </Mapbox.ShapeSource>
      ) : null}
      {visual ? (
        <Mapbox.ShapeSource id="bus" shape={pointShape(visual.point, { heading: visual.heading })}>
          <Mapbox.SymbolLayer id="busSymbol" aboveLayerID="pulseB" style={busStyle} />
        </Mapbox.ShapeSource>
      ) : null}
    </>
  );
}
