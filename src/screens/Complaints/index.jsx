import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import ScreenHeader from '../../components/ScreenHeader';
import { getChildren } from '../../api/children';
import { getMyComplaints } from '../../api/complaints';
import { getErrorMessage } from '../../utils/errors';
import { colors } from '../../styles';
import ComplaintCard from './ComplaintCard';
import ComplaintTabs from './ComplaintTabs';
import NewComplaintForm from './NewComplaintForm';
import styles from './Complaints.styles';

function Separator() {
  return <View style={styles.separator} />;
}

export default function ComplaintsScreen({ navigation, route }) {
  const studentId = route.params?.studentId;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const padding = { paddingHorizontal: width < 380 ? 16 : 20 };

  const [activeTab, setActiveTab] = useState('list');
  const [complaints, setComplaints] = useState([]);
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [list, kids] = await Promise.all([getMyComplaints(), getChildren()]);
      setComplaints(list);
      setChildren(kids);
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

  function handleSubmitted() {
    setActiveTab('list');
    load();
  }

  const childNames = useMemo(
    () => Object.fromEntries(children.map(child => [child.id, child.name])),
    [children],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={padding}>
        <ScreenHeader
          title="Complaints"
          subtitle="Submit requests or report issues directly to administration"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.tabs}>
          <ComplaintTabs value={activeTab} onChange={setActiveTab} />
        </View>
      </View>

      <View style={styles.panels}>
        <View style={activeTab === 'list' ? styles.panel : styles.hidden}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primaryNavy} />
            </View>
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : (
            <FlatList
              style={styles.list}
              data={complaints}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ComplaintCard complaint={item} childName={childNames[item.studentId]} />
              )}
              ItemSeparatorComponent={Separator}
              contentContainerStyle={[styles.listContent, padding, { paddingBottom: 32 + insets.bottom }]}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.primaryNavy]}
                />
              }
              ListEmptyComponent={
                <EmptyState
                  icon={<MaterialIcons name="feedback" size={40} color={colors.primaryNavy} />}
                  iconBg="#243B5A14"
                  message="No complaints yet."
                  style={[styles.emptyState, { minHeight: height * 0.5 }]}
                />
              }
            />
          )}
        </View>

        <View style={activeTab === 'new' ? styles.panel : styles.hidden}>
          <NewComplaintForm
            childList={children}
            initialStudentId={studentId}
            onSubmitted={handleSubmitted}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
