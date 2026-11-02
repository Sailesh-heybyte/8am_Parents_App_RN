import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import AppText from '../../components/AppText';
import { colors, fonts } from '../../styles';

const banner = require('../../assets/images/warm-bus-banner.jpg');

const GRADIENT = [
  { offset: '0', opacity: 0.95 },
  { offset: '0.26', opacity: 0.72 },
  { offset: '0.48', opacity: 0.2 },
  { offset: '0.72', opacity: 0.5 },
  { offset: '0.88', opacity: 1 },
  { offset: '1', opacity: 1 },
];

export default function HomeHeader({ name, horizontalPadding }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.banner, { height: 290 + insets.top }]}>
      <Image source={banner} style={styles.image} resizeMode="cover" />

      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            {GRADIENT.map(stop => (
              <Stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={colors.background}
                stopOpacity={stop.opacity}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#fade)" />
      </Svg>

      <View style={[styles.greeting, { paddingHorizontal: horizontalPadding }]}>
        <AppText variant="bodySecondary" style={styles.hello}>
          Hello,
        </AppText>
        <View style={[styles.nameRow, !name && styles.hidden]}>
          <AppText variant="greeting" numberOfLines={1} style={styles.name}>
            {name || 'Parent'}
          </AppText>
          <AppText style={styles.wave}>👋</AppText>
        </View>
        <AppText variant="bodySecondary" style={styles.subtitle}>
          Here's what's happening with your children today.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  greeting: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
  },
  hello: {
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  hidden: {
    opacity: 0,
  },
  name: {
    flexShrink: 1,
    fontSize: 26,
  },
  wave: {
    fontSize: 22,
    marginLeft: 6,
  },
  subtitle: {
    fontSize: 13.5,
    marginTop: 4,
  },
});
