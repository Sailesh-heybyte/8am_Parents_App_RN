import React, { createContext, useContext, useEffect, useState } from 'react';
import { unregisterDevice } from '../api/devices';
import { setOnSessionExpired } from '../api/client';
import { getDeviceId } from '../utils/deviceId';
import { clearParentName } from '../utils/storage';
import { clearTokens, getTokens, saveTokens } from '../utils/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setOnSessionExpired(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    getTokens()
      .then(tokens => setIsLoggedIn(!!tokens))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setIsLoading(false));
  }, []);

  async function signIn(tokens) {
    await saveTokens(tokens);
    setIsLoggedIn(true);
  }

  async function signOut() {
    // The device call needs the access token, so it must run before clearTokens.
    try { await unregisterDevice(await getDeviceId()); } catch {}
    await clearTokens();
    await clearParentName();
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
