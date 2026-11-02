import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { colors, radius, shadows } from '../styles';

export default function BackButton({ onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <MaterialIcons name="arrow-back-ios-new" size={18} color={colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
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

