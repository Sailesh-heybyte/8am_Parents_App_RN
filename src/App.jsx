import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_PUBLIC_TOKEN } from './config';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SnackbarProvider } from './context/SnackbarContext';
import RootNavigator from './navigation/RootNavigator';
import { colors } from './styles';
import { setupNotificationChannels } from './utils/notifications';

Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);

export default function App() {
  useEffect(() => {
    setupNotificationChannels().catch(() => {});
  }, []);

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
