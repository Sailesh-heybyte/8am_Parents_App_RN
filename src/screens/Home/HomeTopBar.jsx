import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import IconButton from '../../components/IconButton';
import LanguageSelector from '../../components/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../styles';

export default function HomeTopBar({ scrollY, onBellPress, onLogout, horizontalPadding }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const backgroundOpacity = scrollY.interpolate({
    inputRange: [170, 230],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View pointerEvents="box-none" style={[styles.bar, { paddingTop: insets.top, height: insets.top + 60 }]}>
      <Animated.View pointerEvents="none" style={[styles.background, { opacity: backgroundOpacity }]} />
      <View pointerEvents="box-none" style={[styles.row, { paddingHorizontal: horizontalPadding }]}>
        <LanguageSelector />
        <View style={styles.actions}>
          <IconButton onPress={onBellPress} accessibilityLabel={t('announcements')}>
            <MaterialIcons name="notifications-none" size={20} color={colors.textPrimary} />
          </IconButton>
          <IconButton onPress={onLogout} accessibilityLabel={t('logout')}>
            <MaterialIcons name="logout" size={18} color={colors.textSecondary} />
          </IconButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

