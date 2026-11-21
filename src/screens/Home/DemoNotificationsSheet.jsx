import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import AppButton from '../../components/AppButton';
import AppText from '../../components/AppText';
import BottomSheet from '../../components/BottomSheet';
import { useSnackbar } from '../../context/SnackbarContext';
import { fonts } from '../../styles';
import { askNotificationPermission, scheduleNotification } from '../../utils/notifications';

const FIRST_AFTER_MS = 15000;
const THEN_EVERY_MS = 10000;

// Once per app open. Home stays mounted, so this is not reset on navigation.
let demoStarted = false;

// Morning trip only (home → school), in the order a parent gets them.
const MORNING_TRIP = [
  {
    channelId: 'trip_started_8am',
    type: 'trip_started',
    title: name => `${name}'s bus has started`,
    body: () => 'Morning trip to school started. Track it live in the app.',
  },
  {
    channelId: 'bus_approaching_8am',
    type: 'bus_approaching',
    title: () => 'Bus is 10 minutes away',
    body: name => `Get ${name} ready at the stop.`,
  },
  {
    channelId: 'rfid_tap_8am',
    type: 'rfid_tap',
    title: name => `${name} boarded the bus`,
    body: () => 'ID card tapped at 08:05 AM.',
  },
  {
    channelId: 'rfid_tap_8am',
    type: 'rfid_tap',
    title: name => `${name} reached school`,
    body: () => 'ID card tapped at 08:40 AM.',
  },
];

// First one after 15 s, then one every 10 s. Same ids, so playing again replaces the old ones.
async function playMorningTrip(name) {
  const start = Date.now() + FIRST_AFTER_MS;
  await Promise.all(
    MORNING_TRIP.map((step, index) =>
      scheduleNotification(
        {
          id: `demo-am-${index + 1}`,
          channelId: step.channelId,
          title: step.title(name),
          body: step.body(name),
          data: { type: step.type },
        },
        start + index * THEN_EVERY_MS,
      ),
    ),
  );
}

export default function DemoNotificationsSheet({ visible, onClose, childName = 'Your child' }) {
  const showSnackbar = useSnackbar();
  const childNameRef = useRef(childName);
  childNameRef.current = childName;

  async function start() {
    const allowed = await askNotificationPermission();
    if (!allowed) {
      showSnackbar('Allow notifications in phone settings', 'error');
      return false;
    }
    await playMorningTrip(childNameRef.current);
    return true;
  }

  useEffect(() => {
    if (demoStarted) return;
    demoStarted = true;
    start().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function playAgain() {
    onClose();
    if (await start()) showSnackbar('Morning trip demo: first notification in 15 seconds');
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <AppText variant="heading2" style={styles.title}>
        Demo notifications
      </AppText>
      <AppText variant="bodySecondary" style={styles.line}>
        Morning trip: bus started, bus 10 minutes away, boarded, reached school. First one 15 seconds after you tap,
        then one every 10 seconds. Lock the screen to see them like real pushes.
      </AppText>
      <View style={styles.buttons}>
        <AppButton title="Play morning trip" onPress={playAgain} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.bold,
  },
  line: {
    marginTop: 12,
  },
  buttons: {
    marginTop: 16,
  },
});
