import React, { useEffect, useMemo, useRef } from 'react';
import Mapbox from '@rnmapbox/maps';
import { distanceMeters, pointAtDistance, snapToRoute } from '../../utils/routeMath';
import { colors } from '../../styles';

const OFF_ROUTE_M = 80;
const REVERSE_M = 25;
const JUMP_M = 800;
const PASSED_LAG_M = 20;
const HOLD_M = 10;
const TURN_DEG = 28;
const HEADING_HOLD_DEG = 12;
const RETARGET_MS = 650;
const MIN_ZOOM = 11;
const MAX_ZOOM = 18;
const ACQUIRE_MS = 900;
const PITCH = 30;

const casingStyle = {
  lineColor: colors.surfaceWhite,
  lineWidth: 8.5,
  lineCap: 'round',
  lineJoin: 'round',
};

const doneStyle = {
  lineColor: colors.mapRoutePassed,
  lineWidth: 5.5,
};

const aheadBase = {
  lineColor: colors.mapRoute,
  lineWidth: 5.5,
  lineTrimOffset: [0, 0],
};

function aheadPaint(progress) {
  return {
    lineColor: colors.mapRoute,
    lineWidth: 5.5,
    lineTrimOffset: [0, progress],
  };
}

const RouteLine = React.memo(function RouteLine({ shape, aheadRef }) {
  return (
    <Mapbox.ShapeSource id="route" shape={shape} lineMetrics>
      <Mapbox.LineLayer id="routeCasing" style={casingStyle} />
      <Mapbox.LineLayer id="routeDone" aboveLayerID="routeCasing" style={doneStyle} />
      <Mapbox.LineLayer ref={aheadRef} id="routeAhead" aboveLayerID="routeDone" style={aheadBase} />
    </Mapbox.ShapeSource>
  );
});

function headingDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}

function travelHeading(route, distance, reverse) {
  const heading = pointAtDistance(route, distance).bearing;
  return reverse ? (heading + 180) % 360 : heading;
}

function heldHeading(previous, next, hasHeading, moved) {
  if (!hasHeading) return next;
  const delta = Math.abs(headingDelta(previous, next));
  if (delta < HEADING_HOLD_DEG) return previous;
  if (delta < 40 && moved < 18) return previous;
  return next;
}

function followDuration(previousAt, now) {
  if (!previousAt) return 1200;
  const gap = now - previousAt;
  if (!Number.isFinite(gap) || gap < 400) return 1200;
  return Math.min(4000, Math.round(gap));
}

function planHops(route, from, to, duration, bearing, hasHeading) {
  const reverse = to < from;
  const moved = Math.abs(to - from);
  const endPoint = pointAtDistance(route, to).point;
  const heading = heldHeading(bearing, travelHeading(route, from, reverse), hasHeading, moved);
  let endHeading = travelHeading(route, to, reverse);
  if (Math.abs(headingDelta(heading, endHeading)) < HEADING_HOLD_DEG) endHeading = heading;

  const turn = Math.abs(headingDelta(heading, endHeading));
  if (turn < TURN_DEG || Math.abs(to - from) < 25) {
    return [{ distance: to, point: endPoint, heading: endHeading, duration }];
  }

  const span = to - from;
  let split = from + span * 0.5;
  for (let i = 1; i <= 10; i += 1) {
    const distance = from + span * (i / 10);
    const sample = travelHeading(route, distance, reverse);
    if (Math.abs(headingDelta(heading, sample)) >= turn * 0.45) {
      split = distance;
      break;
    }
  }
  if (Math.abs(split - from) < 15 || Math.abs(to - split) < 15) {
    return [{ distance: to, point: endPoint, heading: endHeading, duration }];
  }

  const firstShare = Math.abs(split - from) / Math.abs(span);
  let firstDuration = Math.round(duration * firstShare);
  let secondDuration = duration - firstDuration;
  if (firstDuration < 240) {
    secondDuration -= 240 - firstDuration;
    firstDuration = 240;
  }
  if (secondDuration < 320) {
    firstDuration -= 320 - secondDuration;
    secondDuration = 320;
  }

  return [
    {
      distance: split,
      point: pointAtDistance(route, split).point,
      heading,
      duration: Math.max(200, firstDuration),
    },
    {
      distance: to,
      point: endPoint,
      heading: endHeading,
      duration: Math.max(200, secondDuration),
    },
  ];
}

function passedSignature(distance, gates) {
  let signature = '';
  for (let i = 0; i < gates.length; i += 1) {
    signature += gates[i] < distance - PASSED_LAG_M ? '1' : '0';
  }
  return signature;
}

export function followAnchor(size, padding) {
  const width = size.width || 0;
  const height = size.height || 0;
  return {
    x: (padding.paddingLeft + width - padding.paddingRight) / 2,
    y: (padding.paddingTop + height - padding.paddingBottom) / 2,
  };
}

// The bus icon is a fixed overlay. The camera eases once per location fix,
// and Mapbox interpolates the map underneath it. Per-frame setCamera calls
// with a duration of 0 were snapping the map and making it shake.
export default function LiveBusLayer({ route, fix, gates, cameraRef, zoomRef, busPointRef, padding, onPassed }) {
  const displayedRef = useRef(0);
  const coveredRef = useRef(0);
  const bearingRef = useRef(0);
  const hasHeadingRef = useRef(false);
  const trimRef = useRef(-1);
  const aheadRef = useRef(null);
  const passedKeyRef = useRef(null);
  const gatesRef = useRef(gates);
  const onPassedRef = useRef(onPassed);
  const motionRef = useRef(null);
  const lockedRef = useRef(false);
  const lastFixAtRef = useRef(0);
  const lastZoomRef = useRef(null);
  const lastPaddingRef = useRef('');
  const offRouteRef = useRef(null);
  const paddingRef = useRef(padding);
  const routeRef = useRef(route);
  const ensureLoopRef = useRef(() => {});

  gatesRef.current = gates;
  onPassedRef.current = onPassed;
  paddingRef.current = padding;

  if (routeRef.current !== route) {
    routeRef.current = route;
    displayedRef.current = 0;
    coveredRef.current = 0;
    bearingRef.current = 0;
    hasHeadingRef.current = false;
    trimRef.current = -1;
    passedKeyRef.current = null;
    motionRef.current = null;
    lockedRef.current = false;
    lastFixAtRef.current = 0;
    lastZoomRef.current = null;
    lastPaddingRef.current = '';
    offRouteRef.current = null;
  }

  const routeShape = useMemo(() => ({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: route.path },
  }), [route]);

  useEffect(() => {
    let raf = 0;
    let alive = true;

    function publish(distance) {
      const signature = passedSignature(distance, gatesRef.current);
      const previous = passedKeyRef.current || '';
      if (signature === previous) return;
      const gained = signature.split('').some((bit, index) => bit === '1' && previous[index] !== '1');
      passedKeyRef.current = signature;
      if (gained) onPassedRef.current?.(distance);
    }

    let lastPaint = 0;
    function paintTrim(distance, now, force) {
      if (!force && now - lastPaint < 48) return;
      lastPaint = now;
      const activeRoute = routeRef.current;
      coveredRef.current = Math.max(coveredRef.current, distance);
      const total = activeRoute?.total || 0;
      const progress = total > 0
        ? Math.min(1, Math.round((coveredRef.current / total) * 10000) / 10000)
        : 0;
      if (progress === trimRef.current || !aheadRef.current) return;
      trimRef.current = progress;
      aheadRef.current.setNativeProps({ style: aheadPaint(progress) });
    }

    function cameraExtras() {
      const extras = {};
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current));
      if (lastZoomRef.current == null) {
        lastZoomRef.current = zoom;
        extras.zoomLevel = zoom;
        extras.pitch = PITCH;
      } else if (Math.abs(zoom - lastZoomRef.current) > 0.05) {
        lastZoomRef.current = zoom;
        extras.zoomLevel = zoom;
      }
      const pad = paddingRef.current;
      const key = pad
        ? `${pad.paddingTop},${pad.paddingRight},${pad.paddingBottom},${pad.paddingLeft}`
        : '';
      if (key !== lastPaddingRef.current) {
        lastPaddingRef.current = key;
        if (pad) extras.padding = pad;
      }
      return extras;
    }

    function issue(motion, elapsed) {
      if (!cameraRef.current) return;
      let time = 0;
      let due = -1;
      let remaining = 0;
      for (let i = 0; i < motion.hops.length; i += 1) {
        const hop = motion.hops[i];
        if (elapsed >= time) {
          due = i;
          remaining = Math.max(32, hop.duration - (elapsed - time));
        }
        time += hop.duration;
      }
      if (due < motion.issued) return;
      const hop = motion.hops[due];
      cameraRef.current.setCamera({
        centerCoordinate: hop.point,
        heading: hop.heading,
        animationDuration: remaining,
        animationMode: motion.mode,
        ...(motion.issued === 0 ? cameraExtras() : null),
      });
      bearingRef.current = hop.heading;
      hasHeadingRef.current = true;
      motion.issued = due + 1;
    }

    function step(motion, now) {
      if (!cameraRef.current) return;
      if (motion.start == null) motion.start = now;
      const elapsed = now - motion.start;
      let cursor = motion.from;
      let time = 0;
      let distance = motion.from;
      for (let i = 0; i < motion.hops.length; i += 1) {
        const hop = motion.hops[i];
        const into = elapsed - time;
        if (into < hop.duration || i === motion.hops.length - 1) {
          const t = hop.duration <= 0 ? 1 : Math.min(1, Math.max(0, into / hop.duration));
          distance = cursor + (hop.distance - cursor) * t;
          break;
        }
        time += hop.duration;
        cursor = hop.distance;
        distance = hop.distance;
      }

      issue(motion, elapsed);

      let total = 0;
      for (let i = 0; i < motion.hops.length; i += 1) total += motion.hops[i].duration;
      const finished = elapsed >= total;

      if (motion.alongRoute) {
        displayedRef.current = distance;
        const at = pointAtDistance(routeRef.current, distance);
        busPointRef.current = at.point;
        paintTrim(distance, now, finished);
        publish(distance);
      } else {
        busPointRef.current = motion.hops[motion.hops.length - 1].point;
      }

      if (finished) motion.done = true;
    }

    function frame(now) {
      if (!alive) return;
      const motion = motionRef.current;
      if (!motion || motion.done) {
        raf = 0;
        return;
      }
      step(motion, now);
      if (!alive || !motionRef.current || motionRef.current.done) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    ensureLoopRef.current = () => {
      if (!alive || raf) return;
      raf = requestAnimationFrame(frame);
    };

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ensureLoopRef.current = () => {};
    };
  }, [route, cameraRef, zoomRef, busPointRef]);

  useEffect(() => {
    if (!route || !fix) {
      motionRef.current = null;
      return;
    }

    const snap = snapToRoute(route, fix.point, displayedRef.current);
    const guided = Number.isFinite(fix.distance);
    const total = route.total || 0;
    const target = guided ? Math.max(0, Math.min(total, fix.distance)) : snap.distance;
    const current = displayedRef.current;

    if (snap.offRoute > OFF_ROUTE_M && !guided) {
      const last = offRouteRef.current;
      if (last && distanceMeters(last, fix.point) < 12) return;
      offRouteRef.current = fix.point;
      motionRef.current = {
        from: current,
        start: null,
        alongRoute: false,
        mode: 'easeTo',
        issued: 0,
        done: false,
        hops: [{
          distance: current,
          point: fix.point,
          heading: bearingRef.current,
          duration: 800,
        }],
      };
      ensureLoopRef.current();
      return;
    }

    if (!guided && target < current - REVERSE_M) return;

    const pending = motionRef.current;
    const hops = pending?.hops;
    const destination = pending?.alongRoute && hops?.length
      ? hops[hops.length - 1].distance
      : null;
    const acquiring = !lockedRef.current;
    if (!acquiring && destination != null && Math.abs(destination - target) < HOLD_M) return;
    if (
      !acquiring
      && pending
      && !pending.done
      && destination != null
      && Math.abs(destination - target) < 40
      && Date.now() - pending.acceptedAt < RETARGET_MS
    ) {
      return;
    }

    const now = Date.now();
    const duration = acquiring ? ACQUIRE_MS : followDuration(lastFixAtRef.current, now);
    lastFixAtRef.current = now;
    lockedRef.current = true;
    offRouteRef.current = null;

    if (!guided && Math.abs(target - current) > JUMP_M) {
      const at = pointAtDistance(route, target);
      displayedRef.current = target;
      motionRef.current = {
        from: target,
        start: null,
        acceptedAt: now,
        alongRoute: true,
        mode: 'easeTo',
        issued: 0,
        done: false,
        hops: [{
          distance: target,
          point: at.point,
          heading: heldHeading(bearingRef.current, at.bearing, hasHeadingRef.current, JUMP_M),
          duration: 500,
        }],
      };
      ensureLoopRef.current();
      return;
    }

    const reverse = target < current;
    const moved = Math.abs(target - current);
    const still = moved < 1;
    motionRef.current = {
      from: current,
      start: null,
      acceptedAt: now,
      alongRoute: true,
      mode: still ? 'easeTo' : 'linearTo',
      issued: 0,
      done: false,
      hops: acquiring || still
        ? [{
          distance: target,
          point: pointAtDistance(route, target).point,
          heading: heldHeading(
            bearingRef.current,
            travelHeading(route, target, reverse),
            hasHeadingRef.current,
            moved,
          ),
          duration,
        }]
        : planHops(route, current, target, duration, bearingRef.current, hasHeadingRef.current),
    };
    ensureLoopRef.current();
  }, [route, fix, cameraRef, zoomRef, busPointRef]);

  if (!route) return null;

  return <RouteLine shape={routeShape} aheadRef={aheadRef} />;
}
