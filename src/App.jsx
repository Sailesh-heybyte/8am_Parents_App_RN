import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from './styles';
import AppText from './components/AppText';
import AppButton from './components/AppButton';
import AppTextInput from './components/AppTextInput';
import Card from './components/Card';

// Temporary first screen (replaced by the real Splash/Login soon)
export default function App() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  function handlePress() {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.screen}>
        <AppText variant="greeting" color={colors.primaryNavy}>8AM Parents 🚌</AppText>
        <AppText variant="bodySecondary">Track your child's school bus</AppText>
        <View style={styles.buttonBox}>
          <AppTextInput
            icon="phone-android"
            label="Mobile Number"
            keyboardType="number-pad"
            autoComplete="tel"
            maxLength={10}
            value={phone}
            onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
            style={styles.input}
          />
          <AppButton title="Send OTP" loading={loading} onPress={handlePress} />
          <Card onPress={() => {}} style={styles.card}>
            <AppText variant="heading3">Announcements</AppText>
            <AppText variant="bodySmall">Notices & circulars</AppText>
          </Card>
        </View>
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
  buttonBox: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  input: {
    marginBottom: 16,
  },
  card: {
    marginTop: 16,
  },
});
