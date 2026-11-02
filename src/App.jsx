import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import RootNavigator from './navigation/RootNavigator';
import { colors } from './styles';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AuthProvider>
        <SnackbarProvider>
          <RootNavigator />
        </SnackbarProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
