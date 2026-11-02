import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { colors, fonts, radius, shadows } from '../styles';

export default function ChildPill({ name }) {
  return (
    <View style={styles.pill}>
      <AppText variant="bodySmall" color={colors.primaryNavy} style={styles.text}>
        {name}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surfaceWhite,
    ...shadows.card,
  },
  text: { fontFamily: fonts.bold },
});
