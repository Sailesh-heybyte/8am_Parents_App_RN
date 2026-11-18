import React, { useState } from 'react';
import { Image, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import AppTextInput from '../../components/AppTextInput';
import Card from '../../components/Card';
import LanguageSelector from '../../components/LanguageSelector';
import { requestOtp, verifyOtp } from '../../api/auth';
import { getErrorMessage } from '../../utils/errors';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { colors } from '../../styles';
import styles from './Login.styles';

const logo = require('../../assets/images/logo.png');
const DEV_OTP = __DEV__ ? '123456' : '';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const showSnackbar = useSnackbar();
  const { width } = useWindowDimensions();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(DEV_OTP);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    if (phone.length !== 10) {
      showSnackbar('Enter a valid 10-digit mobile number', 'error');
      return;
    }
    setLoading(true);
    try {
      await requestOtp(phone);
      setOtpSent(true);
      showSnackbar(t('mockOtpSent'));
    } catch (error) {
      showSnackbar(getErrorMessage(error, 'Failed to send OTP. Please check the number.'), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      showSnackbar('Enter the 6-digit OTP', 'error');
      return;
    }
    setLoading(true);
    try {
      const tokens = await verifyOtp(phone, otp);
      await signIn(tokens);
      showSnackbar(t('mockLoginSuccess'), 'success');
    } catch (error) {
      showSnackbar(getErrorMessage(error, t('mockLoginFailed')), 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleChangeNumber() {
    setOtpSent(false);
    setOtp(DEV_OTP);
  }

  function handleResend() {
    setOtp(DEV_OTP);
    handleSendOtp();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: width < 380 ? 16 : 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.languageRow}>
          <LanguageSelector />
        </View>

        <View style={styles.logoBox}>
          <Image source={logo} style={styles.logo} accessibilityLabel="8AM Parents" />
        </View>

        <AppText variant="greeting" style={styles.welcome}>
          {t('welcomeMessage')}
        </AppText>
        <AppText variant="bodySecondary" style={styles.subtitle}>
          {t('welcomeSubtitle')}
        </AppText>

        <Card style={styles.card}>
          <AppText variant="heading2" style={styles.cardTitle}>
            {otpSent ? t('verifyOtpButton') : 'Sign in with Mobile'}
          </AppText>
          <AppText variant="bodySmall" style={styles.cardSubtitle}>
            {otpSent
              ? `Enter the 6-digit code sent to ${phone}`
              : 'We will send a one-time verification code to this number.'}
          </AppText>

          <AppTextInput
            label={t('mobileNumberLabel')}
            icon="phone-android"
            keyboardType="number-pad"
            autoComplete="tel"
            maxLength={10}
            value={phone}
            onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
            editable={!otpSent}
            labelBackground={colors.surfaceWhite}
          />

          {otpSent && (
            <AppTextInput
              label={t('otpLabel')}
              icon="lock-outline"
              keyboardType="number-pad"
              autoComplete="sms-otp"
              maxLength={6}
              value={otp}
              onChangeText={text => setOtp(text.replace(/[^0-9]/g, ''))}
              labelBackground={colors.surfaceWhite}
              style={styles.otpInput}
            />
          )}

          <AppButton
            title={otpSent ? t('verifyOtpButton') : t('requestOtpButton')}
            loading={loading}
            onPress={otpSent ? handleVerifyOtp : handleSendOtp}
            style={styles.button}
          />

          {otpSent && (
            <View style={styles.linksRow}>
              <AppText variant="bodySmall" style={styles.changeNumber} onPress={handleChangeNumber}>
                Change number
              </AppText>
              <AppText
                variant="bodySmall"
                style={styles.resend}
                onPress={loading ? undefined : handleResend}
              >
                {t('resendOtp')}
              </AppText>
            </View>
          )}
        </Card>

        <View style={styles.footer}>
          <MaterialIcons name="verified-user" size={18} color={colors.textSecondary} />
          <AppText variant="bodySmall" style={styles.footerText}>
            Authorized parent portal for verified student route tracking & school updates.
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
