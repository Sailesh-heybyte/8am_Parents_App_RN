import React, { useEffect, useState } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import SplashScreen from '../screens/Splash';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background },
};

export default function RootNavigator() {
  const { isLoading, isLoggedIn } = useAuth();
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !minTimePassed) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={theme}>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
