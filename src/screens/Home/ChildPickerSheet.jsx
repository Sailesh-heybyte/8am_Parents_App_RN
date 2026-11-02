import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import BottomSheet from '../../components/BottomSheet';
import { colors, fonts, radius } from '../../styles';

export default function ChildPickerSheet({ visible, childList, onClose, onSelect }) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <AppText variant="heading2" style={styles.title}>
        Select Child
      </AppText>
      {childList.map(child => (
        <Pressable
          key={child.id}
          onPress={() => onSelect(child)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View style={styles.avatar}>
            <AppText style={styles.initial}>{child.name ? child.name[0].toUpperCase() : 'S'}</AppText>
          </View>
          <AppText variant="heading3" numberOfLines={1} style={styles.name}>
            {child.name}
          </AppText>
          <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>
      ))}
    </BottomSheet>
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
});

