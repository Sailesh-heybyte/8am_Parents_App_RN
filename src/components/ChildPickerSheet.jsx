import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from './AppText';
import BottomSheet from './BottomSheet';
import { colors, fonts, radius } from '../styles';

export default function ChildPickerSheet({
  visible,
  childList,
  onClose,
  onSelect,
  title = 'Select Child',
  noneLabel,
  showStop = false,
  selectedId,
}) {
  const hasSelection = selectedId !== undefined;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <AppText variant="heading2" style={styles.title}>
        {title}
      </AppText>
      {noneLabel ? (
        <PickerRow
          label={noneLabel}
          selected={hasSelection && selectedId == null}
          onPress={() => onSelect(null)}
          avatar={<MaterialIcons name="groups" size={20} color={colors.primaryNavy} />}
        />
      ) : null}
      {childList.map(child => (
        <PickerRow
          key={child.id}
          label={child.name}
          stop={showStop ? child.stopName : ''}
          selected={hasSelection && child.id === selectedId}
          onPress={() => onSelect(child)}
        />
      ))}
    </BottomSheet>
  );
}

function PickerRow({ label, stop, selected, onPress, avatar }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={styles.avatar}>
        {avatar || (
          <AppText style={styles.initial}>{label ? label[0].toUpperCase() : 'S'}</AppText>
        )}
      </View>
      {stop ? (
        <View style={styles.nameBlock}>
          <AppText variant="heading3" numberOfLines={1}>
            {label}
          </AppText>
          <AppText variant="label" color={colors.textSecondary} numberOfLines={1} style={styles.stop}>
            {stop}
          </AppText>
        </View>
      ) : (
        <AppText variant="heading3" numberOfLines={1} style={styles.name}>
          {label}
        </AppText>
      )}
      <MaterialIcons
        name={selected ? 'check' : 'chevron-right'}
        size={20}
        color={selected ? colors.primaryNavy : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, marginBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginBottom: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.background,
  },
  selected: {
    borderColor: colors.primaryNavy,
  },
  pressed: { backgroundColor: colors.inputFill },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#243B5A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryNavy },
  name: { flex: 1 },
  nameBlock: { flex: 1 },
  stop: { fontFamily: fonts.regular, fontSize: 12.5 },
});
