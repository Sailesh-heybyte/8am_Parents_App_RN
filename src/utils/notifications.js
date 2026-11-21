import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';

// Channel ids match the Flutter app and the backend.
const CHANNELS = [
  {
    id: 'default_8am',
    name: '8AM Notifications',
    description: 'School notifications from 8AM app',
  },
  {
    id: 'trip_started_8am',
    name: 'Trip started',
    description: 'When the bus starts its trip',
    sound: 'trip_started_8am',
  },
  {
    id: 'bus_approaching_8am',
    name: 'Bus approaching',
    description: 'When the bus is about 10 minutes from your stop',
    sound: 'bus_approaching_8am',
  },
  {
    id: 'rfid_tap_8am',
    name: 'Card tap',
    description: 'When your child taps their card getting on or off the bus',
    sound: 'rfid_tap_8am',
  },
];

export async function setupNotificationChannels() {
  await Promise.all(
    CHANNELS.map(channel =>
      notifee.createChannel({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        importance: AndroidImportance.HIGH,
        vibration: true,
        badge: true,
        ...(channel.sound ? { sound: channel.sound } : null),
      }),
    ),
  );
}

export async function askNotificationPermission() {
  const settings = await notifee.requestPermission();
  // 1 = AUTHORIZED, 2 = PROVISIONAL
  return settings.authorizationStatus >= 1;
}

const LOGO = require('../assets/images/logo.png');

// Same look as the Flutter app: white 8AM icon in the status bar, logo on the right.
function buildNotification({ id, channelId = 'default_8am', title, body, data = {} }) {
  return {
    id,
    title,
    body,
    data,
    android: {
      channelId,
      smallIcon: 'ic_notification',
      largeIcon: LOGO,
      color: '#1565C0',
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
    },
  };
}

// Firebase pushes will use this same function later (foreground display).
export async function showNotification(notification) {
  await notifee.displayNotification(buildNotification(notification));
}

// Shown by Android at the given time, even if the app is closed or the phone is locked.
export async function scheduleNotification(notification, atMs) {
  await notifee.createTriggerNotification(buildNotification(notification), {
    type: TriggerType.TIMESTAMP,
    timestamp: atMs,
  });
}
