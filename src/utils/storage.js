import AsyncStorage from '@react-native-async-storage/async-storage';

const PARENT_NAME_KEY = 'parentName';
const LANGUAGE_KEY = 'language';

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

export async function getLanguage() {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

export async function saveLanguage(code) {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
  } catch {}
}

