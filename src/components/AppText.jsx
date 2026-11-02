import React from 'react';
import { StyleSheet, Text } from 'react-native';
import useTextScale from '../hooks/useTextScale';
import { typography } from '../styles';

export default function AppText({ variant = 'body', color, style, children, ...rest }) {
  const scale = useTextScale();
  const flat = StyleSheet.flatten([typography[variant], color && { color }, style]) || {};
  const scaled = {
    ...flat,
    fontSize: (flat.fontSize ?? 14) * scale,
    ...(flat.lineHeight ? { lineHeight: flat.lineHeight * scale } : null),
  };

  return (
    <Text allowFontScaling={false} style={scaled} {...rest}>
      {children}
    </Text>
  );
}
