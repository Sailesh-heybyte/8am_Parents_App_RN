import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import AppButton from '../../components/AppButton';
import AppText from '../../components/AppText';
import BottomSheet from '../../components/BottomSheet';
import { useSnackbar } from '../../context/SnackbarContext';
import { colors, fonts, radius } from '../../styles';
import { askNotificationPermission, showNotification } from '../../utils/notifications';

const FIRST_AFTER_MS = 10000;
const THEN_EVERY_MS = 5000;

// Once per app open. Home stays mounted, so this is not reset on navigation.
let demoStarted = false;

const MORNING = [
  {
    label: 'Trip started',
    channelId: 'trip_started_8am',
    type: 'trip_started',
    title: childName => `${childName}'s bus has started`,
    body: () => 'Morning trip to school started.',
  },
  {
    label: 'Bus approaching',
    channelId: 'bus_approaching_8am',
    type: 'bus_approaching',
    title: () => 'Bus is 10 minutes away',
    body: childName => `Get ${childName} ready at the stop.`,
  },
  {
    label: 'Card tap',
    channelId: 'rfid_tap_8am',
    type: 'rfid_tap',
    title: childName => `${childName} boarded the bus`,
    body: () => 'ID card tapped at 08:05 AM.',
  },
  {
    label: 'Reached',
    channelId: 'rfid_tap_8am',
    type: 'rfid_tap',
    title: childName => `${childName} reached school`,
    body: () => 'ID card tapped at 08:40 AM.',
  },
];

const EVENING = [
  {
    label: 'Trip started',
    channelId: 'trip_started_8am',
    type: 'trip_started',
    title: childName => `${childName}'s bus has left school`,
    body: () => 'Evening trip home started.',
  },
  {
    label: 'Card tap',
    channelId: 'rfid_tap_8am',
    type: 'rfid_tap',
    title: childName => `${childName} boarded the bus`,
    body: () => 'ID card tapped at 03:35 PM.',
  },
  {
    label: 'Bus approaching',
    channelId: 'bus_approaching_8am',
    type: 'bus_approaching',
    title: () => 'Bus is 10 minutes from your stop',
    body: childName => `${childName} will reach home soon.`,
  },
  {
    label: 'Reached',
    channelId: 'rfid_tap_8am',
    type: 'rfid_tap',
    title: childName => `${childName} got off at the stop`,
    body: () => 'ID card tapped at 04:10 PM.',
  },
];

export default function DemoNotificationsSheet({ visible, onClose, childName = 'Your child' }) {
  const showSnackbar = useSnackbar();
  const [trip, setTrip] = useState('morning');
  const demos = trip === 'morning' ? MORNING : EVENING;
  const childNameRef = useRef(childName);
  childNameRef.current = childName;

  useEffect(() => {
    if (demoStarted) return;
    demoStarted = true;
    askNotificationPermission().then(allowed => {
      if (!allowed) {
        showSnackbar('Allow notifications in phone settings', 'error');
        return;
      }
      [...MORNING, ...EVENING].forEach((demo, index) => {
        setTimeout(() => {
          const name = childNameRef.current;
          showNotification({
            channelId: demo.channelId,
            title: demo.title(name),
            body: demo.body(name),
            data: { type: demo.type },
          });
        }, FIRST_AFTER_MS + index * THEN_EVERY_MS);
      });
    });
  }, [showSnackbar]);

  async function send(demo) {
    const allowed = await askNotificationPermission();
    if (!allowed) {
      showSnackbar('Allow notifications in phone settings', 'error');
      return;
    }
    onClose();
    setTimeout(() => {
      showNotification({
        channelId: demo.channelId,
        title: demo.title(childName),
        body: demo.body(childName),
        data: { type: demo.type },
      });
    }, 3000);
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <AppText variant="heading2" style={styles.title}>
        Demo notifications
      </AppText>
      <View style={styles.chips}>
        <Pressable
          onPress={() => setTrip('morning')}
          style={[styles.chip, trip === 'morning' && styles.chipSelected]}
        >
          <AppText color={trip === 'morning' ? colors.surfaceWhite : colors.textPrimary} style={styles.chipText}>
            Morning
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setTrip('evening')}
          style={[styles.chip, trip === 'evening' && styles.chipSelected]}
        >
          <AppText color={trip === 'evening' ? colors.surfaceWhite : colors.textPrimary} style={styles.chipText}>
            Evening
          </AppText>
        </Pressable>
      </View>
      <AppText variant="bodySecondary" style={styles.line}>
        Morning, then evening. First one 10 seconds after Home opens, then one every 5 seconds. Lock the screen to see them.
      </AppText>
      <View style={styles.buttons}>
        {demos.map(demo => (
          <AppButton key={demo.label} title={demo.label} onPress={() => send(demo)} />
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.bold,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.neutralBadgeBg,
  },
  chipSelected: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  chipText: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
  },
  line: {
    marginTop: 12,
  },
  buttons: {
    gap: 10,
    marginTop: 16,
  },
});
