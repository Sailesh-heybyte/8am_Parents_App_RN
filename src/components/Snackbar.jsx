import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './AppText';
import { colors, radius } from '../styles';

const BACKGROUNDS = {
  info: colors.primaryNavy,
  success: colors.liveGreen,
  error: colors.errorRed,
};

export default function Snackbar({ message, type = 'info' }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.snackbar,
        { bottom: insets.bottom + 16, backgroundColor: BACKGROUNDS[type] || BACKGROUNDS.info, opacity },
      ]}
    >
      <AppText color={colors.surfaceWhite}>{message}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
});

