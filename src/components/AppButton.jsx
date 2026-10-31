import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { colors, radius } from '../styles';

export default function AppButton({ title, onPress, loading = false, disabled = false, style }) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size={20} color={colors.surfaceWhite} />
      ) : (
        <AppText variant="button">{title}</AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.primaryNavyDark },
  disabled: { opacity: 0.6 },
});

