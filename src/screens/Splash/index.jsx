import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../../styles';

const logo = require('../../assets/images/splash-logo.png');

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 900,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <View style={styles.screen}>
      <Animated.Image
        source={logo}
        style={[styles.logo, { opacity }]}
        accessibilityLabel="8AM Parents"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWhite,
  },
  logo: {
    width: 200,
    height: 200,
  },
});

