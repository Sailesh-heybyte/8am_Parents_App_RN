import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from './AppText';
import useTextScale from '../hooks/useTextScale';
import { colors, fonts, radius } from '../styles';

export default function AppTextInput({
  label,
  icon,
  value,
  editable = true,
  labelBackground = colors.background,
  error,
  multiline = false,
  style,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const scale = useTextScale();
  const active = focused || !!value;
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [active, anim]);

  const restLeft = icon ? 48 : 16;

  const labelMotion = {
    transform: [
      { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 12 - restLeft] }) },
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -25] }) },
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] }) },
    ],
  };

  return (
    <View>
      <View
        style={[
          styles.box,
          focused && styles.focused,
          !editable && styles.disabled,
          error && (focused ? styles.errorFocused : styles.error),
          style,
        ]}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={colors.textSecondary}
            style={multiline ? styles.multilineIcon : undefined}
          />
        )}
        <TextInput
          style={[styles.input, { fontSize: 15 * scale }, multiline && styles.multilineInput]}
          value={value}
          editable={editable}
          placeholderTextColor={colors.textSecondary}
          cursorColor={colors.primaryNavy}
          selectionColor={colors.primaryNavyLight}
          allowFontScaling={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
          multiline={multiline}
        />
        {label && (
          <Animated.Text
            allowFontScaling={false}
            style={[
              styles.label,
              { fontSize: 13.5 * scale },
              { left: restLeft - 4, backgroundColor: active ? labelBackground : 'transparent' },
              labelMotion,
            ]}
          >
            {label}
          </Animated.Text>
        )}
      </View>
      {error ? (
        <AppText variant="bodySmall" color={colors.errorRed} style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.inputFill,
  },
  focused: {
    borderColor: colors.primaryNavy,
    borderWidth: 1.6,
  },
  disabled: {
    backgroundColor: colors.inputFillDisabled,
    borderColor: colors.cardBorderSubtle,
  },
  error: {
    borderColor: colors.errorRed,
    borderWidth: 1,
  },
  errorFocused: {
    borderColor: colors.errorRed,
    borderWidth: 1.6,
  },
  multilineIcon: {
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 120,
    paddingTop: 14,
  },
  errorText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
  },
  label: {
    position: 'absolute',
    top: 15,
    paddingHorizontal: 4,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: colors.textSecondary,
    transformOrigin: 'left center',
    pointerEvents: 'none',
  },
});
