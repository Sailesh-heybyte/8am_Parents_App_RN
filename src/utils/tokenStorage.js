import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.eightam.parent.rn.auth';

export async function saveTokens({ accessToken, refreshToken }) {
  await Keychain.setGenericPassword('auth', JSON.stringify({ accessToken, refreshToken }), {
    service: SERVICE,
  });
}

export async function getTokens() {
  const credentials = await Keychain.getGenericPassword({ service: SERVICE });
  if (!credentials) return null;
  try {
    return JSON.parse(credentials.password);
  } catch {
    return null;
  }
}

export async function clearTokens() {
  await Keychain.resetGenericPassword({ service: SERVICE });
}

