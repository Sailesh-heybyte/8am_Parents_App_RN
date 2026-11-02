import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import BackButton from './BackButton';

export default function ScreenHeader({ title, subtitle, onBack }) {
  return (
    <View style={styles.header}>
      {onBack && <BackButton onPress={onBack} style={styles.back} />}
      <AppText variant="greeting" style={styles.title}>
        {title}
      </AppText>
      {subtitle && (
        <AppText variant="bodySmall" style={styles.subtitle}>
          {subtitle}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  back: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
});

