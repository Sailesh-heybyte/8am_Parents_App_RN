import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import AppText from '../../components/AppText';
import { useLanguage } from '../../context/LanguageContext';
import { colors, fonts, shadows } from '../../styles';

export default function ComplaintTabs({ value, onChange }) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Tab label={t('complaintsTitle')} selected={value === 'list'} onPress={() => onChange('list')} />
      <Tab label={t('newComplaint')} selected={value === 'new'} onPress={() => onChange('new')} />
    </View>
  );
}

function Tab({ label, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tab, selected ? styles.tabActive : styles.tabInactive]}
    >
      <AppText
        variant="label"
        numberOfLines={1}
        color={selected ? colors.primaryNavy : colors.textSecondary}
        style={selected ? styles.labelActive : styles.labelInactive}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2EFE9',
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: colors.cardBorder,
    padding: 4,
  },
  tab: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.surfaceWhite,
    borderWidth: 0.8,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  tabInactive: {
    backgroundColor: 'transparent',
    borderWidth: 0.8,
    borderColor: 'transparent',
  },
  labelActive: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  labelInactive: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
