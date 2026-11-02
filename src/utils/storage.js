import AsyncStorage from '@react-native-async-storage/async-storage';

const PARENT_NAME_KEY = 'parentName';

export async function getParentName() {
  try {
    return await AsyncStorage.getItem(PARENT_NAME_KEY);
  } catch {
    return null;
  }
}

export async function saveParentName(name) {
  try {
    await AsyncStorage.setItem(PARENT_NAME_KEY, name);
  } catch {}
}

export async function clearParentName() {
  try {
    await AsyncStorage.removeItem(PARENT_NAME_KEY);
  } catch {}
}

