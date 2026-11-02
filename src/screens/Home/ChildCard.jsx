import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { colors, fonts } from '../../styles';

const AVATAR_COLORS = ['#243B5A', '#4A6B5D', '#8B5E3C'];

export default function ChildCard({ child, index, onPress }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initial = child.name ? child.name[0].toUpperCase() : 'C';

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: `${color}1F` }]}>
        <AppText color={color} style={styles.initial}>
          {initial}
        </AppText>
      </View>
      <View style={styles.info}>
        <AppText variant="heading2" numberOfLines={1}>
          {child.name}
        </AppText>
        <AppText variant="bodySmall" style={styles.roll}>
          Roll No: {child.rollNo}
        </AppText>
        <StatusBadge label="Bus Service Active" tone="success" style={styles.badge} />
      </View>
      <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  roll: {
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    marginTop: 6,
    borderRadius: 10,
  },
});

