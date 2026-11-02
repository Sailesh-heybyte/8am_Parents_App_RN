import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, RefreshControl, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import StatusBadge from '../../components/StatusBadge';
import MarkAbsentSheet from '../../components/MarkAbsentSheet';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../api/auth';
import { getChildren } from '../../api/children';
import { getParentName, saveParentName } from '../../utils/storage';
import { getErrorMessage } from '../../utils/errors';
import { colors } from '../../styles';
import ChildCard from './ChildCard';
import ChildPickerSheet from './ChildPickerSheet';
import HomeHeader from './HomeHeader';
import HomeTopBar from './HomeTopBar';
import ActionCard from './ActionCard';
import styles from './Home.styles';

function Separator() {
  return <View style={styles.separator} />;
}

export default function HomeScreen({ navigation }) {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [name, setName] = useState('');
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [absentChild, setAbsentChild] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  function handleMarkAbsentPress() {
    if (children.length === 1) {
      setAbsentChild(children[0]);
    } else {
      setPickerOpen(true);
    }
  }

  function handlePickChild(child) {
    setPickerOpen(false);
    setTimeout(() => setAbsentChild(child), 300);
  }

  const padding = { paddingHorizontal: width < 380 ? 16 : 20 };

  const loadChildren = useCallback(async () => {
    try {
      setError('');
      setChildren(await getChildren());
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load children data.'));
    }
  }, []);

  useEffect(() => {
    getParentName().then(saved => {
      if (saved) {
        setName(current => current || saved);
      }
    });
    getMe()
      .then(me => {
        setName(me.fullName);
        saveParentName(me.fullName);
      })
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
    return (
      <View style={padding}>
        <AppText
          variant={error ? 'body' : 'bodySecondary'}
          color={error ? colors.errorRed : undefined}
          style={styles.stateText}
        >
          {error || 'No children linked to this account.'}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Animated.FlatList
        data={error ? [] : children}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View style={padding}>
            <ChildCard
              child={item}
              index={index}
              onPress={() => navigation.navigate('ChildDetails', { child: item })}
            />
          </View>
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 36 + insets.bottom }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primaryNavy]}
            progressViewOffset={insets.top + 60}
          />
        }
        ListHeaderComponent={
          <View>
            <HomeHeader name={name} horizontalPadding={padding.paddingHorizontal} />
            {children.length > 0 && (
              <View style={[styles.actionsRow, padding]}>
                <ActionCard
                  title="Announcements"
                  subtitle="Notices & circulars"
                  icon="notifications-none"
                  iconBg={colors.infoBlueBg}
                  iconColor={colors.infoBlue}
                  onPress={() => {}}
                />
                <ActionCard
                  title="Mark Absent"
                  subtitle="Notify school & bus"
                  icon="event-busy"
                  iconBg={colors.busYellowLight}
                  iconColor={colors.busYellowText}
                  onPress={handleMarkAbsentPress}
                />
              </View>
            )}
            <View style={[styles.sectionRow, padding]}>
              <AppText variant="heading2" style={styles.sectionTitle}>
                My Children
              </AppText>
              <StatusBadge label={`${children.length}`} tone="neutral" style={styles.countBadge} />
            </View>
          </View>
        }
      />
      <HomeTopBar
        scrollY={scrollY}
        onBellPress={() => {}}
        onLogout={signOut}
        horizontalPadding={padding.paddingHorizontal}
      />
      <ChildPickerSheet
        visible={pickerOpen}
        childList={children}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickChild}
      />
      <MarkAbsentSheet
        child={absentChild}
        visible={absentChild !== null}
        onClose={() => setAbsentChild(null)}
      />
    </View>
  );
}
