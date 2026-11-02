import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import IconTile from '../../components/IconTile';
import { colors, fonts } from '../../styles';

export default function ActionCard({ title, subtitle, icon, iconBg, iconColor, onPress }) {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <IconTile bg={iconBg}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </IconTile>
        <MaterialIcons name="arrow-forward" size={15} color={colors.textSecondary} />
      </View>
      <AppText variant="heading3" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
      <AppText variant="bodySmall" numberOfLines={2} style={styles.subtitle}>
        {subtitle}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});

