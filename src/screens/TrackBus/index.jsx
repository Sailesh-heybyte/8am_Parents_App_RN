import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Mapbox from '@rnmapbox/maps';
import { HouseIcon } from 'phosphor-react-native';
import AppText from '../../components/AppText';
import BackButton from '../../components/BackButton';
import Card from '../../components/Card';
import { useLanguage } from '../../context/LanguageContext';
import { MAPBOX_STYLE_URL } from '../../config';
import { colors } from '../../styles';
import styles from './TrackBus.styles';

const HYDERABAD = [78.4867, 17.3850];

export default function TrackBus({ navigation, route }) {
  const { child } = route.params;
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const padding = width < 380 ? 16 : 20;
  const hasHome = child.homeLatitude != null && child.homeLongitude != null;
  const home = hasHome ? [child.homeLongitude, child.homeLatitude] : null;

  return (
    <View style={styles.screen}>
      <Mapbox.MapView
        style={[styles.map, { width, height }]}
        styleURL={MAPBOX_STYLE_URL}
        surfaceView={false}
        compassEnabled={false}
        scaleBarEnabled={false}
        logoEnabled
        attributionEnabled
      >
        <Mapbox.Camera
          centerCoordinate={home || HYDERABAD}
          zoomLevel={home ? 15 : 10}
          animationDuration={0}
        />
        {home ? (
          <Mapbox.MarkerView coordinate={home} allowOverlap>
            <View style={styles.marker}>
              <HouseIcon weight="fill" size={20} color={colors.primaryNavy} />
            </View>
          </Mapbox.MarkerView>
        ) : null}
      </Mapbox.MapView>

      <View style={[styles.header, { top: insets.top + 12, left: padding, right: padding }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.pill}>
          <AppText variant="heading3" color={colors.primaryNavy} numberOfLines={1} style={styles.pillText}>
            {child.name}
          </AppText>
        </View>
      </View>

      <View style={[styles.bottom, { left: padding, right: padding, bottom: insets.bottom + 16 }]}>
        <Card>
          <AppText color={colors.textPrimary} style={styles.title}>
            {t('liveBusTracking')}
          </AppText>
          <AppText variant="bodySecondary" style={styles.subtitle}>
            {hasHome ? t('homeLocationSetLabel') : t('homeLocationNotSet')}
          </AppText>
        </Card>
      </View>
    </View>
  );
}
