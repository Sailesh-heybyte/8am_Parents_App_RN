import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import { formatDate, isAfterToday } from '../../utils/date';
import { colors, radius } from '../../styles';

export const DIRECTIONS = {
  AM_PICKUP: { label: 'Morning (AM Pickup)', icon: 'wb-sunny', fg: colors.busYellowText, bg: colors.busYellowLight },
  PM_DROP: { label: 'Evening (PM Drop)', icon: 'nightlight-round', fg: '#512DA8', bg: '#EDE7F6' },
  BOTH: { label: 'Full Day (Pickup & Drop)', icon: 'all-inclusive', fg: colors.textPrimary, bg: colors.neutralBadgeBg },
};

export default function AbsenceCard({ absence, onPress, onCancel }) {
  const direction = DIRECTIONS[absence.direction] || DIRECTIONS.BOTH;
  const hasReason = absence.reason.trim() !== '';
  const canCancel = isAfterToday(absence.date);

  return (
    <Card onPress={onPress}>
      <View style={styles.topRow}>
        <View style={[styles.pill, { backgroundColor: direction.bg }]}>
          <MaterialIcons name={direction.icon} size={13} color={direction.fg} />
          <AppText variant="badge" color={direction.fg} style={styles.pillText}>
            {direction.label}
          </AppText>
        </View>
        {canCancel && (
          <Pressable onPress={onCancel} hitSlop={6} accessibilityRole="button" style={[styles.pill, styles.cancel]}>
            <MaterialIcons name="delete-outline" size={13} color={colors.errorRed} />
            <AppText variant="badge" color={colors.errorRed} style={styles.pillText}>
              Cancel
            </AppText>
          </Pressable>
        )}
      </View>

      <View style={styles.dateRow}>
        <MaterialIcons name="calendar-today" size={15} color={colors.primaryNavy} />
        <AppText variant="heading3">{formatDate(absence.date)}</AppText>
      </View>

      {hasReason && (
        <View style={styles.reasonBox}>
          <MaterialIcons name="chat-bubble-outline" size={13} color={colors.textSecondary} />
          <AppText variant="bodySmall" color={colors.textPrimary} style={styles.reason}>
            {absence.reason}
          </AppText>
        </View>
      )}

      <View style={styles.editRow}>
        <AppText variant="bodySmall" style={styles.editText}>
          Tap to edit reason
        </AppText>
        <MaterialIcons name="edit" size={11} color={colors.textSecondary} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  pillText: { fontSize: 11 },
  cancel: { backgroundColor: colors.errorRedBg },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  reasonBox: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.background,
  },
  reason: { flex: 1, fontSize: 12 },
  editRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 6 },
  editText: { fontSize: 10.5 },
});

