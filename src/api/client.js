import axios from 'axios';
import { clearTokens, getTokens, saveTokens } from '../utils/tokenStorage';

const BASE_URL = 'https://api.the8am.in';
const AUTH_PATHS = ['/api/v1/iam/request-otp', '/api/v1/iam/verify-otp', '/api/v1/iam/refresh'];

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;
let onSessionExpired = () => {};

export function setOnSessionExpired(callback) {
  onSessionExpired = callback;
}

function isAuthPath(url = '') {
  return AUTH_PATHS.some(path => url.includes(path));
}

client.interceptors.request.use(async config => {
  if (!isAuthPath(config.url)) {
    const tokens = await getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
  }
  return config;
});

async function refreshAccessToken() {
  const tokens = await getTokens();
  if (!tokens?.refreshToken) return null;
  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/v1/iam/refresh`,
      { refresh_token: tokens.refreshToken },
      { timeout: 15000 },
    );
    await saveTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
    return data.access_token;
  } catch {
    return null;
  }
}

async function endSession(error) {
  await clearTokens();
  onSessionExpired();
  return Promise.reject(error);
}

client.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    if (error.response?.status !== 401 || !original || isAuthPath(original.url)) {
      return Promise.reject(error);
    }
    if (original._retry) {
      return endSession(error);
    }
    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const accessToken = await refreshPromise;
    if (!accessToken) {
      return endSession(error);
    }

    original.headers.Authorization = `Bearer ${accessToken}`;
    return client(original);
  },
);

export default client;
