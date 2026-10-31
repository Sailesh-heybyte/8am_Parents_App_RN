import React from 'react';
import { Text } from 'react-native';
import { typography } from '../styles';

export default function AppText({ variant = 'body', color, style, children, ...rest }) {
  return (
    <Text
      maxFontSizeMultiplier={1.3}
      style={[typography[variant], color && { color }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

