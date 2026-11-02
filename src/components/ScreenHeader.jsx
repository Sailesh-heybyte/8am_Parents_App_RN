import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import BackButton from './BackButton';

export default function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <View style={styles.header}>
      {(onBack || right) && (
        <View style={styles.topRow}>
          {onBack ? <BackButton onPress={onBack} /> : <View />}
          {right}
        </View>
      )}
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
  header: { paddingTop: 16, paddingBottom: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 26 },
  subtitle: { fontSize: 13, marginTop: 4 },
});
