import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import AppButton from './AppButton';
import IconTile from './IconTile';
import { colors, radius } from '../styles';

export default function EmptyState({ icon, iconBg, title, message, actionTitle, onAction }) {
  return (
    <View style={styles.box}>
      {icon && (
        <IconTile size={80} bg={iconBg} style={styles.tile}>
          {icon}
        </IconTile>
      )}
      {title && (
        <AppText variant="heading1" style={styles.title}>
          {title}
        </AppText>
      )}
      {message && (
        <AppText color={colors.textSecondary} style={styles.message}>
          {message}
        </AppText>
      )}
      {actionTitle && <AppButton title={actionTitle} onPress={onAction} style={styles.action} />}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    padding: 40,
  },
  tile: {
    borderRadius: radius.xl,
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  action: {
    width: 'auto',
    paddingHorizontal: 28,
    marginTop: 24,
  },
});

