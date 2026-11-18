import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { ClockCountdownIcon } from 'phosphor-react-native';
import AppText from '../../components/AppText';
import BottomSheet from '../../components/BottomSheet';
import { colors, fonts } from '../../styles';

const OPTIONS = [5, 10, 15, 20, 25, 30];

export default function LeadTimeSheet({ visible, title, value, onSelect, onClose }) {
  const { width } = useWindowDimensions();
  const bleed = width < 380 ? styles.bleedNarrow : styles.bleedWide;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <AppText variant="heading3" color={colors.textPrimary} style={styles.title}>
        {`${title} - Notification radius`}
      </AppText>
      <AppText variant="label" color={colors.textSecondary} style={styles.subtitle}>
        Choose lead time before bus arrives at stop
      </AppText>
      <View style={[styles.divider, bleed]} />
      {OPTIONS.map(minutes => {
        const selected = minutes === value;
        return (
          <Pressable
            key={minutes}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => {
              onClose();
              if (minutes !== value) onSelect(minutes);
            }}
            style={({ pressed }) => [
              styles.row,
              bleed,
              selected && styles.rowSelected,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.option}>
              <ClockCountdownIcon
                weight="regular"
                size={18}
                color={selected ? colors.primaryNavy : colors.textSecondary}
              />
              <AppText
                variant="label"
                color={selected ? colors.primaryNavy : colors.textPrimary}
                style={selected ? styles.optionSelected : styles.optionText}
              >
                {`${minutes} minutes away`}
              </AppText>
            </View>
            {selected ? <MaterialIcons name="check-circle" size={20} color={colors.primaryNavy} /> : null}
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginTop: 16,
    backgroundColor: colors.cardBorder,
  },
  bleedNarrow: {
    marginHorizontal: -16,
  },
  bleedWide: {
    marginHorizontal: -20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  rowSelected: {
    backgroundColor: '#F2EFE999',
  },
  rowPressed: {
    backgroundColor: colors.inputFill,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  optionSelected: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
