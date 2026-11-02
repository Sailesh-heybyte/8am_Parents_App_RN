import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import AppText from './AppText';
import AppButton from './AppButton';
import IconTile from './IconTile';
import useTextScale from '../hooks/useTextScale';
import { addDays, formatDate, isAfterToday, isSameDay, parseDate, toApiDate } from '../utils/date';
import { colors, fonts, radius } from '../styles';

const OPTIONS = [
  { value: 'BOTH', title: 'Full Day', subtitle: 'Pickup & Drop', icon: 'all-inclusive' },
  { value: 'AM_PICKUP', title: 'Morning', subtitle: 'AM Pickup only', icon: 'wb-sunny' },
  { value: 'PM_DROP', title: 'Evening', subtitle: 'PM Drop only', icon: 'nightlight-round' },
];

export default function MarkAbsentForm({
  child,
  existing = null,
  absences = [],
  onClose,
  onSubmit,
  onCancelAbsence,
  loading = false,
  error = '',
}) {
  const scale = useTextScale();
  const today = new Date();
  const [date, setDate] = useState(existing ? parseDate(existing.date) : today);
  const [direction, setDirection] = useState(existing ? existing.direction : 'BOTH');
  const [reason, setReason] = useState(existing ? existing.reason : '');
  const [reasonFocused, setReasonFocused] = useState(false);

  const isToday = isSameDay(date, today);
  const isTomorrow = isSameDay(date, addDays(today, 1));
  const isCustom = !isToday && !isTomorrow;
  const apiDate = toApiDate(date);
  const match = absences.find(a => a.date === apiDate && a.direction === direction);
  const isUpdating = Boolean(match);
  const canCancel = isUpdating && isAfterToday(apiDate);

  function openDatePicker() {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'date',
      minimumDate: addDays(today, -30),
      maximumDate: addDays(today, 90),
      onValueChange: (event, selected) => {
        if (selected) {
          setDate(selected);
        }
      },
    });
  }

  return (
    <View>
      <View style={styles.titleRow}>
        <IconTile size={42} bg="#243B5A14">
          <MaterialIcons name="event-busy" size={22} color={colors.primaryNavy} />
        </IconTile>
        <View style={styles.titleText}>
          <AppText variant="heading2" style={styles.title}>
            Mark Absent
          </AppText>
          <AppText variant="bodySmall" color={colors.primaryNavy} style={styles.childName}>
            {child.name}
          </AppText>
        </View>
        <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
          <MaterialIcons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <AppText variant="heading3" style={styles.sectionLabel}>
        Select Date
      </AppText>
      <View style={styles.chipRow}>
        <Pressable onPress={() => setDate(new Date())} style={[styles.chip, isToday && styles.chipSelected]}>
          <AppText color={isToday ? colors.surfaceWhite : colors.textPrimary} style={styles.chipText}>
            Today
          </AppText>
        </Pressable>
        <Pressable onPress={() => setDate(addDays(new Date(), 1))} style={[styles.chip, isTomorrow && styles.chipSelected]}>
          <AppText color={isTomorrow ? colors.surfaceWhite : colors.textPrimary} style={styles.chipText}>
            Tomorrow
          </AppText>
        </Pressable>
        <Pressable onPress={openDatePicker} style={[styles.pickChip, isCustom && styles.pickChipSelected]}>
          <MaterialIcons name="calendar-month" size={16} color={isCustom ? colors.primaryNavy : '#616161'} />
          <AppText numberOfLines={1} color={isCustom ? colors.primaryNavy : '#424242'} style={styles.chipText}>
            {isCustom ? apiDate : 'Pick Date'}
          </AppText>
        </Pressable>
      </View>
      <View style={styles.dateInfo}>
        <AppText color="#000000DE" style={styles.dateInfoText}>
          📅 {formatDate(apiDate)} ({apiDate})
        </AppText>
      </View>

      <AppText variant="heading3" style={styles.sectionLabel}>
        Absence Direction
      </AppText>
      <View style={styles.optionRow}>
        {OPTIONS.map(option => {
          const selected = direction === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setDirection(option.value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <MaterialIcons name={option.icon} size={20} color={selected ? colors.primaryNavy : colors.textSecondary} />
              <AppText color={selected ? colors.primaryNavy : colors.textPrimary} style={styles.optionTitle}>
                {option.title}
              </AppText>
              <AppText color={selected ? '#243B5ACC' : colors.textSecondary} style={styles.optionSubtitle}>
                {option.subtitle}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.reasonHeader}>
        <AppText variant="heading3" style={styles.reasonLabel}>
          Reason (optional, max 500 chars)
        </AppText>
        <AppText color="#9E9E9E" style={styles.counter}>
          {reason.length}/500
        </AppText>
      </View>
      <TextInput
        value={reason}
        onChangeText={setReason}
        maxLength={500}
        multiline
        textAlignVertical="top"
        placeholder="e.g. Doctor appointment, family function..."
        placeholderTextColor="#BDBDBD"
        cursorColor={colors.primaryNavy}
        selectionColor={colors.primaryNavyLight}
        allowFontScaling={false}
        onFocus={() => setReasonFocused(true)}
        onBlur={() => setReasonFocused(false)}
        style={[styles.reasonInput, { fontSize: 13 * scale }, reasonFocused && styles.reasonFocused]}
      />

      {isUpdating && (
        <View style={styles.notice}>
          <MaterialIcons name="info-outline" size={20} color={colors.busYellowText} />
          <AppText color={colors.busYellowText} style={styles.noticeText}>
            Already marked absent for this date & direction. Submitting will update the reason.
          </AppText>
        </View>
      )}

      {error !== '' && (
        <AppText variant="bodySmall" color={colors.errorRed} style={styles.error}>
          {error}
        </AppText>
      )}

      <AppButton
        title={isUpdating ? 'Update Absence Reason' : 'Mark Absent'}
        loading={loading}
        onPress={() => onSubmit({ date: apiDate, direction, reason: reason.trim() })}
        style={styles.submit}
      />

      {canCancel && onCancelAbsence && (
        <Pressable
          onPress={() => onCancelAbsence(match)}
          disabled={loading}
          accessibilityRole="button"
          style={styles.cancelAbsence}
        >
          <MaterialIcons name="delete-outline" size={18} color={colors.errorRed} />
          <AppText color={colors.errorRed} style={styles.cancelAbsenceText}>
            Cancel Absence
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleText: { flex: 1, marginLeft: 14 },
  title: { fontFamily: fonts.bold, fontSize: 18 },
  childName: { fontFamily: fonts.semiBold, fontSize: 13 },
  sectionLabel: { marginTop: 20, marginBottom: 10 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.neutralBadgeBg,
  },
  chipSelected: { backgroundColor: colors.primaryNavy, borderColor: colors.primaryNavy },
  chipText: { fontFamily: fonts.semiBold, fontSize: 12.5 },
  pickChip: {
    flex: 1,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: colors.background,
  },
  pickChipSelected: { borderColor: colors.primaryNavy, backgroundColor: '#243B5A1F' },
  dateInfo: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
  },
  dateInfoText: { fontFamily: fonts.medium, fontSize: 12.5 },
  optionRow: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.background,
  },
  optionSelected: { borderWidth: 1.5, borderColor: colors.primaryNavy, backgroundColor: '#243B5A14' },
  optionTitle: { fontFamily: fonts.semiBold, fontSize: 12.5, marginTop: 6, textAlign: 'center' },
  optionSubtitle: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  reasonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 },
  reasonLabel: { flex: 1, marginRight: 8 },
  counter: { fontSize: 11 },
  reasonInput: {
    minHeight: 90,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.inputFill,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
  },
  reasonFocused: { borderColor: colors.primaryNavy, borderWidth: 1.6 },
  error: { marginTop: 14, textAlign: 'center' },
  submit: { marginTop: 24 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#F59E0B4D',
    backgroundColor: colors.busYellowLight,
  },
  noticeText: { flex: 1, fontFamily: fonts.medium, fontSize: 12 },
  cancelAbsence: {
    minHeight: 44,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelAbsenceText: { fontFamily: fonts.semiBold, fontSize: 14 },
});

