import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import ScreenHeader from '../../components/ScreenHeader';
import { getMyAnnouncements } from '../../api/announcements';
import { getErrorMessage } from '../../utils/errors';
import { colors } from '../../styles';
import AnnouncementCard from './AnnouncementCard';
import styles from './Announcements.styles';

function Separator() {
  return <View style={styles.separator} />;
}

export default function AnnouncementsScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const padding = { paddingHorizontal: width < 380 ? 16 : 20 };

  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getMyAnnouncements();
      setAnnouncements(data);
      setError('');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await load();
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={padding}>
        <ScreenHeader
          title="Announcements"
          subtitle="Official route notices and circulars from administration"
          onBack={() => navigation.goBack()}
        />
      </View>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryNavy} />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={load} buttonColor={colors.pink} />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <AnnouncementCard announcement={item} />}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={[
            styles.listContent,
            padding,
            { paddingBottom: 32 + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.pink]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<MaterialIcons name="campaign" size={40} color={colors.pink} />}
              iconBg={colors.pinkBg}
              message="No announcements yet."
              style={[styles.emptyState, { minHeight: height * 0.5 }]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
