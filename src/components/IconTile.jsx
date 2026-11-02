import React from 'react';
import { StyleSheet, View } from 'react-native';
import { radius } from '../styles';

export default function IconTile({ children, bg, size = 36, style }) {
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: bg }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

