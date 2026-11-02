import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import {
  BellIcon,
  BusIcon,
  CalendarXIcon,
  ChatIcon,
  ClockCounterClockwiseIcon,
  GearIcon,
  HouseIcon,
} from 'phosphor-react-native';
import AppText from '../../components/AppText';
import BackButton from '../../components/BackButton';
import Card from '../../components/Card';
import IconTile from '../../components/IconTile';
import StatusBadge from '../../components/StatusBadge';
import FeatureCard from './FeatureCard';
import ConfirmDialog from '../../components/ConfirmDialog';
import MarkAbsentSheet from '../../components/MarkAbsentSheet';
import { cancelAbsence, getAbsences } from '../../api/absences';
import { getErrorMessage } from '../../utils/errors';
import { useSnackbar } from '../../context/SnackbarContext';
import AbsenceCard from './AbsenceCard';
import NoAbsencesCard from './NoAbsencesCard';
import { colors } from '../../styles';
import styles from './ChildDetails.styles';

const SHORT_NAMES = { AM_PICKUP: 'AM Pickup', PM_DROP: 'PM Drop', BOTH: 'Full Day' };

export default function ChildDetailsScreen({ navigation, route }) {
  const { child } = route.params;
  const { width } = useWindowDimensions();
  const stop = child.stopName || child.routeName;
  const initial = child.name ? child.name[0].toUpperCase() : 'S';
  const homeLocationSet = child.homeLatitude != null && child.homeLongitude != null;
  const showSnackbar = useSnackbar();
  const [absences, setAbsences] = useState([]);
  const [absencesLoading, setAbsencesLoading] = useState(true);
  const [absentSheetOpen, setAbsentSheetOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [editAbsence, setEditAbsence] = useState(null);

  const loadAbsences = useCallback(async () => {
    try {
      setAbsences(await getAbsences(child.id));
    } catch (e) {
      showSnackbar(getErrorMessage(e, 'Failed to load absences.'), 'error');
    }
  }, [child.id, showSnackbar]);

  useEffect(() => {
    loadAbsences().finally(() => setAbsencesLoading(false));
  }, [loadAbsences]);

  function openAbsentSheet() {
    setEditAbsence(null);
    setAbsentSheetOpen(true);
  }

  function openEditSheet(absence) {
    setEditAbsence(absence);
    setAbsentSheetOpen(true);
  }

  function handleCancelFromSheet(absence) {
    setAbsentSheetOpen(false);
    setTimeout(() => setCancelTarget(absence), 300);
  }

  async function handleConfirmCancel() {
    setCancelling(true);
    try {
      await cancelAbsence(child.id, cancelTarget);
      await loadAbsences();
      setCancelTarget(null);
      showSnackbar('Absence cancelled successfully.', 'success');
    } catch (e) {
      setCancelTarget(null);
      showSnackbar(getErrorMessage(e, "Couldn't update the absence. Please try again."), 'error');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: width < 380 ? 16 : 20 }]}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          {stop !== '' && (
            <View style={styles.routePill}>
              <MaterialIcons name="school" size={15} color={colors.textSecondary} />
              <AppText variant="bodySmall" style={styles.routeText}>
                {child.routeName || stop}
              </AppText>
            </View>
          )}
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.avatar}>
            <AppText style={styles.initial}>{initial}</AppText>
          </View>
          <View style={styles.summaryInfo}>
            <AppText variant="heading1" style={styles.childName}>
              {child.name}
            </AppText>
            <View style={styles.badges}>
              <StatusBadge label={`Roll No: ${child.rollNo}`} tone="neutral" />
              {stop !== '' && <StatusBadge label={`Stop ${stop}`} tone="success" />}
            </View>
          </View>
        </Card>

        <Card onPress={() => {}} style={styles.trackingCard}>
          <IconTile size={48} bg={colors.busYellowLight} style={styles.busTile}>
            <MaterialIcons name="directions-bus" size={24} color={colors.busYellowText} />
          </IconTile>
          <View style={styles.trackingInfo}>
            <View style={styles.trackingTitleRow}>
              <AppText variant="heading2" style={styles.trackingTitle}>
                Live Bus Tracking
              </AppText>
              <View style={styles.liveDot} />
            </View>
            <AppText variant="bodySmall" numberOfLines={2} style={styles.trackingDesc}>
              Advanced real-time vehicle tracking system featuring high-precision accuracy and robust child safety protocols.
            </AppText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.textSecondary} />
        </Card>

        <AppText variant="heading2" style={styles.sectionTitle}>
          Quick Access
        </AppText>

        <View style={styles.gridRow}>
          <FeatureCard
            fill
            title="Track Bus"
            subtitle="Real-time GPS"
            Icon={BusIcon}
            iconBg={colors.busYellowLight}
            iconColor={colors.busYellowText}
            onPress={() => {}}
          />
          <FeatureCard
            fill
            title="Announcements"
            subtitle="Latest updates"
            Icon={BellIcon}
            iconBg={colors.infoBlueBg}
            iconColor={colors.infoBlue}
            onPress={() => {}}
          />
        </View>

        <View style={styles.gridRow}>
          <FeatureCard
            fill
            title="Complaints"
            subtitle="New Complaint"
            Icon={ChatIcon}
            iconBg={colors.neutralBadgeBg}
            iconColor={colors.primaryNavy}
            onPress={() => {}}
          />
          <FeatureCard
            fill
            title="Alert Settings"
            subtitle="Configure your bus alerts"
            Icon={GearIcon}
            iconBg={colors.liveGreenBg}
            iconColor={colors.liveGreenText}
            onPress={() => {}}
          />
        </View>

        <View style={styles.stack}>
          <FeatureCard
            title="Mark Absent"
            subtitle={`Notify school & bus if ${child.name} won't attend (Morning, Evening, or Full Day)`}
            Icon={CalendarXIcon}
            iconBg={colors.warningOrangeBg}
            iconColor={colors.warningOrange}
            onPress={openAbsentSheet}
          />
          <FeatureCard
            title="Trip History"
            subtitle={`Past bus trips for ${child.name} and how each one ended`}
            Icon={ClockCounterClockwiseIcon}
            iconBg={colors.infoBlueBg}
            iconColor={colors.infoBlue}
            onPress={() => navigation.navigate('TripHistory', { child })}
          />
          <FeatureCard
            title="Home Location"
            subtitle={homeLocationSet ? 'Home address set' : 'Home address not set'}
            Icon={HouseIcon}
            iconBg={colors.busYellowLight}
            iconColor={colors.busYellowText}
            onPress={() => {}}
          />
        </View>

        <View style={styles.absencesHeader}>
          <AppText variant="heading2" style={styles.absencesTitle}>
            Planned Absences
          </AppText>
          <Pressable onPress={openAbsentSheet} hitSlop={6} accessibilityRole="button" style={styles.markLink}>
            <MaterialIcons name="add" size={16} color={colors.primaryNavy} />
            <AppText variant="bodySmall" style={styles.markLinkText}>
              Mark Absent
            </AppText>
          </Pressable>
        </View>

        {absencesLoading ? (
          <ActivityIndicator color={colors.primaryNavy} style={styles.absencesLoader} />
        ) : absences.length === 0 ? (
          <NoAbsencesCard childName={child.name} onMarkPress={openAbsentSheet} />
        ) : (
          <View style={styles.stack}>
            {absences.map(absence => (
              <AbsenceCard
                key={absence.id}
                absence={absence}
                onPress={() => openEditSheet(absence)}
                onCancel={() => setCancelTarget(absence)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <MarkAbsentSheet
        child={child}
        existing={editAbsence}
        absences={absences}
        visible={absentSheetOpen}
        onClose={() => setAbsentSheetOpen(false)}
        onSaved={loadAbsences}
        onCancelAbsence={handleCancelFromSheet}
      />
      <ConfirmDialog
        visible={cancelTarget !== null}
        title="Cancel Absence?"
        message={
          cancelTarget
            ? `Are you sure you want to cancel the marked absence for ${cancelTarget.date} (${SHORT_NAMES[cancelTarget.direction] || 'Full Day'})?`
            : ''
        }
        icon={<MaterialIcons name="delete-outline" size={20} color={colors.errorRed} />}
        cancelLabel="Keep Marked"
        confirmLabel="Yes, Cancel Absence"
        destructive
        loading={cancelling}
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
      />
    </SafeAreaView>
  );
}
