import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, radius, shadows } from '../styles';

export default function IconButton({ children, onPress, accessibilityLabel, size = 38, style }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size },
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  pressed: {
    backgroundColor: colors.inputFill,
  },
});

