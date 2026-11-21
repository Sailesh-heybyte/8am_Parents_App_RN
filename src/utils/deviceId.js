import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'deviceId';

export async function getDeviceId() {
  try {
    const saved = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (saved) return saved;
  } catch {}

  const id = `android-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  } catch {}
  return id;
}
