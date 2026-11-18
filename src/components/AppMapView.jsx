import React, { forwardRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_STYLE_URL } from '../config';

// surfaceView={false} because a SurfaceView was hidden behind the screen.
// The map is given an explicit pixel size because flex:1 gave it a height of 0
// on RN 0.88 Android (see patches/@rnmapbox+maps+10.3.18.patch).
// The map is absolutely positioned so its pixel size can never push the parent's
// layout (otherwise a stale size makes the map area grow past the screen).
const AppMapView = forwardRef(function AppMapView({ style, children, ...rest }, ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ready = size.width > 0 && size.height > 0;

  return (
    <View style={[styles.fill, style]} onLayout={event => setSize(event.nativeEvent.layout)}>
      {ready ? (
        <Mapbox.MapView
          ref={ref}
          style={{ position: 'absolute', top: 0, left: 0, width: size.width, height: size.height }}
          styleURL={MAPBOX_STYLE_URL}
          surfaceView={false}
          compassEnabled={false}
          scaleBarEnabled={false}
          logoEnabled
          attributionEnabled
          {...rest}
        >
          {children}
        </Mapbox.MapView>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
});

export default AppMapView;
