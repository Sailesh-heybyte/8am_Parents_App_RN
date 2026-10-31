import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './styles';
import AppText from './components/AppText';

// Temporary first screen (replaced by the real Splash/Login soon)
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.screen}>
        <AppText variant="greeting" color={colors.primaryNavy}>8AM Parents 🚌</AppText>
        <AppText variant="bodySecondary">Track your child's school bus</AppText>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
