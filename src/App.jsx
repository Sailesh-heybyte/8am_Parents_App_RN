import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { BusIcon, MegaphoneIcon } from 'phosphor-react-native';
import { colors, spacing } from './styles';
import AppText from './components/AppText';
import AppButton from './components/AppButton';
import AppTextInput from './components/AppTextInput';
import Card from './components/Card';
import IconTile from './components/IconTile';
import StatusBadge from './components/StatusBadge';
import ScreenHeader from './components/ScreenHeader';
import EmptyState from './components/EmptyState';

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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <AppText variant="greeting" color={colors.primaryNavy}>8AM Parents 🚌</AppText>
          <AppText variant="bodySecondary">Track your child's school bus</AppText>
          <View style={styles.buttonBox}>
            <ScreenHeader
              title="Announcements"
              subtitle="Official route notices and circulars from administration"
              onBack={() => {}}
            />
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
              <View style={styles.tileRow}>
                <IconTile bg={colors.infoBlueBg}>
                  <MaterialIcons name="notifications-none" size={20} color={colors.infoBlue} />
                </IconTile>
                <IconTile bg={colors.busYellowLight}>
                  <BusIcon size={20} color={colors.busYellowText} weight="bold" />
                </IconTile>
              </View>
              <AppText variant="heading3">Announcements</AppText>
              <AppText variant="bodySmall">Notices & circulars</AppText>
              <View style={styles.badgeList}>
                <StatusBadge label="Bus Service Active" tone="success" />
                <StatusBadge label="Did not board" tone="error" />
                <StatusBadge label="Roll No: RJY-101" tone="neutral" />
              </View>
            </Card>
            <EmptyState
              icon={<MegaphoneIcon size={40} color={colors.pink} />}
              iconBg={colors.pinkBg}
              message="No announcements yet."
              actionTitle="Try Again"
              onAction={() => {}}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
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
  tileRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badgeList: {
    gap: 6,
    marginTop: 10,
  },
});
