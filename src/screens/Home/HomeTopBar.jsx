import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import IconButton from '../../components/IconButton';
import { colors } from '../../styles';

export default function HomeTopBar({ scrollY, onBellPress, onLogout, horizontalPadding }) {
  const insets = useSafeAreaInsets();
  const backgroundOpacity = scrollY.interpolate({
    inputRange: [170, 230],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View pointerEvents="box-none" style={[styles.bar, { paddingTop: insets.top, height: insets.top + 60 }]}>
      <Animated.View pointerEvents="none" style={[styles.background, { opacity: backgroundOpacity }]} />
      <View pointerEvents="box-none" style={[styles.row, { paddingHorizontal: horizontalPadding }]}>
        <IconButton onPress={onBellPress} accessibilityLabel="Announcements">
          <MaterialIcons name="notifications-none" size={20} color={colors.textPrimary} />
        </IconButton>
        <IconButton onPress={onLogout} accessibilityLabel="Logout">
          <MaterialIcons name="logout" size={18} color={colors.textSecondary} />
        </IconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
});

