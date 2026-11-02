import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import ChildPill from '../../components/ChildPill';
import MessageCard from '../../components/MessageCard';
import ScreenHeader from '../../components/ScreenHeader';
import TripCard from '../TripHistory/TripCard';
import { getTripDetail } from '../../api/trips';
import { formatClock } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';
import { colors, fonts } from '../../styles';

const SOURCES = { RFID_TAP: 'ID card tap', DRIVER_CONFIRM: 'Confirmed by driver' };

function timeWithSource(time, source) {
  const clock = formatClock(time);
  if (!clock) return null;
  return SOURCES[source] ? `${clock} · ${SOURCES[source]}` : clock;
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={18} color={colors.textSecondary} />
      <AppText variant="bodySmall" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="bodySmall" color={value ? colors.textPrimary : colors.textMuted} style={styles.value}>
        {value || 'Not recorded'}
      </AppText>
    </View>
  );
}

export default function TripDetailScreen({ navigation, route }) {
  const { child, tripId } = route.params;
  const { width } = useWindowDimensions();
  const padding = { paddingHorizontal: width < 380 ? 16 : 20 };
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTripDetail(child.id, tripId)
      .then(setTrip)
      .catch(e => setError(getErrorMessage(e, "Couldn't load this trip. Please try again.")))
      .finally(() => setLoading(false));
  }, [child.id, tripId]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={padding}>
        <ScreenHeader title="Trip Details" onBack={() => navigation.goBack()} right={<ChildPill name={child.name} />} />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primaryNavy} style={styles.loader} />
      ) : error ? (
        <View style={padding}>
          <MessageCard icon="error-outline" text={error} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, padding]}>
          <TripCard trip={trip} />
          <Card style={styles.infoCard}>
            <InfoRow icon="place" label="Stop" value={trip.stopName} />
            <InfoRow icon="login" label="Boarded" value={timeWithSource(trip.boardedAt, trip.boardSource)} />
            <InfoRow icon="logout" label="Got off" value={timeWithSource(trip.deboardedAt, trip.deboardSource)} />
            <InfoRow icon="directions-bus" label="Bus" value={trip.registrationNumber} />
            <InfoRow icon="person-outline" label="Driver" value={trip.driverName} />
            <InfoRow
              icon="schedule"
              label="Trip time"
              value={trip.startedAt ? `${formatClock(trip.startedAt)} – ${formatClock(trip.endedAt) || '—'}` : null}
            />
          </Card>
          {trip.messages.length > 0 && (
            <>
              <AppText variant="heading2" style={styles.sectionTitle}>
                Notifications sent
              </AppText>
              <Card style={styles.infoCard}>
                {trip.messages.map((m, index) => (
                  <InfoRow key={index} icon="notifications-none" label={formatClock(m.createdAt) || ''} value={m.message} />
                ))}
              </Card>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1 },
  content: { paddingTop: 4, paddingBottom: 32 },
  infoCard: { marginTop: 10, padding: 16 },
  sectionTitle: { fontFamily: fonts.bold, marginTop: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  label: { width: 80 },
  value: { flex: 1, fontFamily: fonts.semiBold },
});

