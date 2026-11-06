import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import EmptyState from '../../components/EmptyState';
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

  function handleRetry() {
    setIsLoading(true);
    setError('');
    load();
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
        <View style={[styles.centerContainer, styles.errorContainer]}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <AppText color={colors.textSecondary} style={styles.errorMessage}>
            {error}
          </AppText>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
            onPress={handleRetry}
            accessibilityRole="button"
          >
            <MaterialIcons name="refresh" size={18} color={colors.surfaceWhite} />
            <AppText style={styles.retryButtonText}>Try Again</AppText>
          </Pressable>
        </View>
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
