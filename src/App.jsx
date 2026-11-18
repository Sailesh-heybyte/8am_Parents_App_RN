import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_PUBLIC_TOKEN } from './config';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SnackbarProvider } from './context/SnackbarContext';
import RootNavigator from './navigation/RootNavigator';
import { colors } from './styles';

Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LanguageProvider>
        <AuthProvider>
          <SnackbarProvider>
            <RootNavigator />
          </SnackbarProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
