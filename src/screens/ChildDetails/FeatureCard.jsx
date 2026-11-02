import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import IconTile from '../../components/IconTile';
import { colors, fonts } from '../../styles';

export default function FeatureCard({ title, subtitle, Icon, iconBg, iconColor, onPress, fill = false }) {
  return (
    <Card onPress={onPress} style={[styles.card, fill && styles.fill]}>
      <IconTile bg={iconBg}>
        <Icon size={20} color={iconColor} weight="bold" />
      </IconTile>
      <AppText variant="heading3" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="bodySmall" numberOfLines={2} style={styles.subtitle}>
        {subtitle}
      </AppText>
      <View style={fill ? styles.spacer : styles.gap} />
      <View style={styles.arrowRow}>
        <MaterialIcons name="arrow-forward" size={15} color={colors.textSecondary} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  fill: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    marginTop: 14,
  },
  subtitle: {
    fontSize: 11.5,
    lineHeight: 15.5,
    marginTop: 4,
  },
  spacer: {
    flex: 1,
    minHeight: 8,
  },
  gap: {
    height: 8,
  },
  arrowRow: {
    alignItems: 'flex-end',
  },
});

