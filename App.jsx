import React from 'react';
import { StatusBar, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Temporary first screen (replaced by the real Splash/Login soon)
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>8AM Parents 🚌</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5', // Flutter app's warm background
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#243B5A', // Flutter app's navy
  },
});