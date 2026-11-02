import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import IconTile from '../../components/IconTile';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/date';
import { colors, fonts } from '../../styles';

const OUTCOMES = {
  safe: { label: 'Reached safely', tone: 'success' },
  needs_confirmation: { label: 'Needs confirmation', tone: 'warning' },
  did_not_board: { label: 'Did not board', tone: 'error' },
  absent: { label: 'Marked absent', tone: 'neutral' },
};

export default function TripCard({ trip, onPress }) {
  const isPickup = trip.direction === 'AM_PICKUP';
  const outcome = OUTCOMES[trip.outcome] || { label: trip.outcome, tone: 'neutral' };
  const meta = [trip.routeName, trip.registrationNumber].filter(Boolean).join(' · ');

  return (
    <Card onPress={onPress} style={styles.card}>
      <IconTile bg={isPickup ? colors.busYellowLight : colors.infoBlueBg}>
        <MaterialIcons
          name={isPickup ? 'wb-sunny' : 'nights-stay'}
          size={20}
          color={isPickup ? colors.busYellowText : colors.infoBlue}
        />
      </IconTile>
      <View style={styles.info}>
        <AppText variant="heading3" style={styles.title}>
          {isPickup ? 'Morning pickup' : 'Evening drop'} · {formatDate(trip.date)}
        </AppText>
        {meta !== '' && (
          <AppText variant="bodySmall" numberOfLines={1} style={styles.meta}>
            {meta}
          </AppText>
        )}
        <StatusBadge label={outcome.label} tone={outcome.tone} style={styles.badge} />
      </View>
      {onPress && <MaterialIcons name="chevron-right" size={22} color={colors.textSecondary} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 14, marginRight: 8 },
  title: { fontFamily: fonts.bold },
  meta: { fontSize: 12, marginTop: 4 },
  badge: { marginTop: 8 },
});
