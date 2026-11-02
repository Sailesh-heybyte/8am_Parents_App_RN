import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import ChildPill from '../../components/ChildPill';
import ScreenHeader from '../../components/ScreenHeader';
import { getTripHistory } from '../../api/trips';
import { getErrorMessage } from '../../utils/errors';
import { colors } from '../../styles';
import TripCard from './TripCard';
import styles from './TripHistory.styles';

function Separator() {
  return <View style={styles.separator} />;
}

function MessageCard({ icon, text }) {
  return (
    <Card style={styles.messageCard}>
      <MaterialIcons name={icon} size={24} color={colors.textSecondary} />
      <AppText variant="bodySmall" style={styles.messageText}>
        {text}
      </AppText>
    </Card>
  );
}

export default function TripHistoryScreen({ navigation, route }) {
  const { child } = route.params;
  const { width } = useWindowDimensions();
  const padding = { paddingHorizontal: width < 380 ? 16 : 20 };
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadTrips = useCallback(async () => {
    try {
      setError('');
      setTrips(await getTripHistory(child.id));
    } catch (e) {
      setError(getErrorMessage(e, "Couldn't load trip history. Pull to retry."));
    }
  }, [child.id]);

  useEffect(() => {
    loadTrips().finally(() => setLoading(false));
  }, [loadTrips]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={padding}>
        <ScreenHeader
          title="Trip History"
          subtitle="Past bus trips and how each one ended"
          onBack={() => navigation.goBack()}
          right={<ChildPill name={child.name} />}
        />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primaryNavy} style={styles.loader} />
      ) : (
        <FlatList
          data={error ? [] : trips}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TripCard trip={item} onPress={() => {}} />}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={
            <MessageCard
              icon={error ? 'error-outline' : 'directions-bus'}
              text={error || 'No finished trips yet.'}
            />
          }
          contentContainerStyle={[styles.list, padding]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primaryNavy]} />
          }
        />
      )}
    </SafeAreaView>
  );
}

