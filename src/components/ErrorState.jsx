import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from './AppText';
import { useLanguage } from '../context/LanguageContext';
import { colors, fonts } from '../styles';

export default function ErrorState({ title, message, onRetry, buttonColor = colors.primaryNavy }) {
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <MaterialIcons name="error-outline" size={48} color="#F44336" />
      <View style={styles.copy}>
        {title ? (
          <AppText variant="heading2" color={colors.textPrimary} style={styles.title}>
            {title}
          </AppText>
        ) : null}
        <AppText color={colors.textSecondary} style={styles.message}>
          {message}
        </AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.button, { backgroundColor: buttonColor }, pressed && styles.pressed]}
      >
        <MaterialIcons name="refresh" size={18} color={colors.surfaceWhite} />
        <AppText style={styles.buttonText}>{t('tryAgain')}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  copy: {
    alignSelf: 'stretch',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    alignSelf: 'stretch',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: colors.surfaceWhite,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
