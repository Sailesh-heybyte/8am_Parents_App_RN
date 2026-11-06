import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadows } from '../styles';

export default function Card({ children, onPress, style, ...rest }) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    ...shadows.card,
  },
  pressed: {
    backgroundColor: colors.inputFill,
  },
});
