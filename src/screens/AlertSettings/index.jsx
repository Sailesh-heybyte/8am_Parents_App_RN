import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GraduationCapIcon, HouseIcon } from 'phosphor-react-native';
import AppText from '../../components/AppText';
import ErrorState from '../../components/ErrorState';
import ScreenHeader from '../../components/ScreenHeader';
import { getNotificationSettings, updateNotificationSettings } from '../../api/children';
import { useSnackbar } from '../../context/SnackbarContext';
import { getErrorMessage } from '../../utils/errors';
import { colors } from '../../styles';
import LeadTimeCard from './LeadTimeCard';
import LeadTimeSheet from './LeadTimeSheet';
import styles from './AlertSettings.styles';

export default function AlertSettingsScreen({ navigation, route }) {
  const { child } = route.params;
  const showSnackbar = useSnackbar();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const padding = { paddingHorizontal: width < 380 ? 16 : 20 };

  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    try {
      setSettings(await getNotificationSettings(child.id));
      setError('');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [child.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await load();
  }

  async function changeLead(key, minutes) {
    const previous = settings;
    setSettings({ ...settings, [key]: minutes });
    setIsSaving(true);
    try {
      const saved = await updateNotificationSettings(child.id, { [key]: minutes });
      setSettings(saved);
      showSnackbar('Alert settings updated successfully', 'success');
    } catch (e) {
      setSettings(previous);
      showSnackbar(getErrorMessage(e), 'error');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={padding}>
        <ScreenHeader
          title="Alert Settings"
          subtitle="Configure push notification alert distance and arrival time"
          onBack={() => navigation.goBack()}
          right={
            <View style={styles.pill}>
              <AppText variant="heading3" color={colors.primaryNavy} numberOfLines={1} style={styles.pillText}>
                {child.name}
              </AppText>
            </View>
          }
        />
      </View>

      {isLoading && !settings ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primaryNavy} />
          <AppText color={colors.textSecondary} style={styles.loadingText}>
            Loading alert settings...
          </AppText>
        </View>
      ) : error && !settings ? (
        <ErrorState title="Failed to load alert settings" message={error} onRetry={load} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, padding, { paddingBottom: 32 + insets.bottom }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primaryNavy]}
            />
          }
        >
          <LeadTimeCard
            icon={<GraduationCapIcon weight="bold" size={24} color={colors.infoBlue} />}
            iconBg={colors.infoBlueBg}
            iconColor={colors.infoBlue}
            title="To school"
            description={`Receive push notifications when the bus is getting close to your home stop to pick up ${child.name}.`}
            minutes={settings.amLeadMinutes}
            disabled={isSaving}
            onPress={() => setEditing('am')}
          />
          <LeadTimeCard
            icon={<HouseIcon weight="fill" size={24} color={colors.busYellowText} />}
            iconBg={colors.busYellowLight}
            iconColor={colors.busYellowText}
            title="To home"
            description={`Receive push notifications when the bus is getting close to your home stop to drop off ${child.name}.`}
            minutes={settings.pmLeadMinutes}
            disabled={isSaving}
            onPress={() => setEditing('pm')}
          />
        </ScrollView>
      )}

      <LeadTimeSheet
        visible={!!editing}
        title={editing === 'am' ? 'To school' : 'To home'}
        value={editing === 'am' ? settings?.amLeadMinutes : settings?.pmLeadMinutes}
        onClose={() => setEditing(null)}
        onSelect={minutes => changeLead(editing === 'am' ? 'amLeadMinutes' : 'pmLeadMinutes', minutes)}
      />
    </SafeAreaView>
  );
}
