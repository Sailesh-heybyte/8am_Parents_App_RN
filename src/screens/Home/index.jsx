import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../api/auth';
import { getChildren } from '../../api/children';
import { getErrorMessage } from '../../utils/errors';
import { colors } from '../../styles';
import ChildCard from './ChildCard';
import styles from './Home.styles';

function Separator() {
  return <View style={styles.separator} />;
}

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { width } = useWindowDimensions();
  const [name, setName] = useState('');
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadChildren = useCallback(async () => {
    try {
      setError('');
      setChildren(await getChildren());
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load children data.'));
    }
  }, []);

  useEffect(() => {
    getMe()
      .then(me => setName(me.fullName))
      .catch(() => {});
    loadChildren().finally(() => setLoading(false));
  }, [loadChildren]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  }

  function renderEmpty() {
    if (loading) {
      return <ActivityIndicator color={colors.primaryNavy} style={styles.loader} />;
    }
    if (error) {
      return (
        <AppText color={colors.errorRed} style={styles.stateText}>
          {error}
        </AppText>
      );
    }
    return (
      <AppText variant="bodySecondary" style={styles.stateText}>
        No children linked to this account.
      </AppText>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={error ? [] : children}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <ChildCard child={item} index={index} onPress={() => {}} />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.content, { paddingHorizontal: width < 380 ? 16 : 20 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primaryNavy]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.topRow}>
              <AppText variant="bodySecondary">{name ? `Hello, ${name}` : ' '}</AppText>
              <AppText variant="bodySmall" style={styles.logout} onPress={signOut}>
                Logout
              </AppText>
            </View>
            <View style={styles.sectionRow}>
              <AppText variant="heading2" style={styles.sectionTitle}>
                My Children
              </AppText>
              <StatusBadge label={`${children.length}`} tone="neutral" style={styles.countBadge} />
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
