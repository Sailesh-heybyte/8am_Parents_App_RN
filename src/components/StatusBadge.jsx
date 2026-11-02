import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { colors, radius } from '../styles';

const TONES = {
  success: { fg: colors.liveGreenText, bg: colors.liveGreenBg },
  warning: { fg: colors.warningOrange, bg: colors.warningOrangeBg },
  error: { fg: colors.errorRed, bg: colors.errorRedBg },
  info: { fg: colors.infoBlue, bg: colors.infoBlueBg },
  neutral: { fg: colors.neutralBadgeText, bg: colors.neutralBadgeBg },
};

export default function StatusBadge({ label, tone = 'neutral', style }) {
  const { fg, bg } = TONES[tone] || TONES.neutral;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <AppText variant="badge" color={fg} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  text: {
    fontSize: 11,
  },
});

