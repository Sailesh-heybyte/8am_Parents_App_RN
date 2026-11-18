import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import Mapbox from '@rnmapbox/maps';
import AppButton from '../../components/AppButton';
import AppMapView from '../../components/AppMapView';
import AppText from '../../components/AppText';
import AppTextInput from '../../components/AppTextInput';
import BackButton from '../../components/BackButton';
import { getNotificationSettings, updateHomeLocation } from '../../api/children';
import { useLanguage } from '../../context/LanguageContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { getErrorMessage } from '../../utils/errors';
import { colors } from '../../styles';
import styles from './HomeLocation.styles';

const DEFAULT_CENTER = [83.2185, 17.6868];
const PIN_ZOOM = 17;

export default function HomeLocation({ navigation, route }) {
  const { child } = route.params;
  const { t } = useLanguage();
  const showSnackbar = useSnackbar();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const padding = { paddingHorizontal: width < 380 ? 16 : 20 };
  const hasHome = child.homeLatitude != null && child.homeLongitude != null;
  const mapRef = useRef(null);
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getNotificationSettings(child.id)
      .then(settings => {
        if (active && settings.homeAddress) {
          setAddress(current => (current === '' ? settings.homeAddress : current));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [child.id]);

  async function handleSave() {
    if (isSaving) return;
    if (!address.trim()) {
      setAddressError(t('homeAddressRequired'));
      return;
    }
    Keyboard.dismiss();
    setIsSaving(true);
    try {
      const [longitude, latitude] = await mapRef.current.getCenter();
      await updateHomeLocation(child.id, { latitude, longitude, address: address.trim() });
      showSnackbar(t('homeLocationSaved'), 'success');
      navigation.popTo(
        'ChildDetails',
        { child: { ...child, homeLatitude: latitude, homeLongitude: longitude } },
        { merge: true },
      );
    } catch (e) {
      showSnackbar(getErrorMessage(e), 'error');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={[styles.header, padding]}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerText}>
          <AppText color={colors.textPrimary} style={styles.title}>
            {t('homeLocation')}
          </AppText>
          <AppText variant="bodySecondary" numberOfLines={1}>
            {child.name}
          </AppText>
        </View>
      </View>

      <View style={styles.mapArea}>
        <AppMapView ref={mapRef}>
          <Mapbox.Camera
            defaultSettings={{
              centerCoordinate: hasHome ? [child.homeLongitude, child.homeLatitude] : DEFAULT_CENTER,
              zoomLevel: hasHome ? PIN_ZOOM : 12,
            }}
          />
        </AppMapView>
        <View pointerEvents="none" style={styles.pinLayer}>
          <MaterialIcons name="location-on" size={48} color={colors.errorRed} style={styles.pin} />
        </View>
      </View>

      <KeyboardAvoidingView behavior="padding">
        <View style={[styles.panel, padding, { paddingBottom: 16 + insets.bottom }]}>
          <AppText variant="bodySecondary">
            {t('homePinHint', { childName: child.name })}
          </AppText>
          <AppTextInput
            icon="home"
            label={t('homeAddressLabel')}
            labelBackground={colors.surfaceWhite}
            value={address}
            onChangeText={text => {
              setAddress(text);
              setAddressError('');
            }}
            maxLength={255}
            autoCapitalize="words"
            returnKeyType="done"
            error={addressError}
            editable={!isSaving}
            style={styles.field}
          />
          <AppButton
            title={t('saveHomeLocation')}
            loading={isSaving}
            onPress={handleSave}
            style={styles.save}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
