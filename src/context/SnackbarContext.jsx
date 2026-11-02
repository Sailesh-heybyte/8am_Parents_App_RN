import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Snackbar from '../components/Snackbar';

const SnackbarContext = createContext(() => {});

export function SnackbarProvider({ children }) {
  const [snack, setSnack] = useState(null);
  const timer = useRef(null);

  const showSnackbar = useCallback((message, type = 'info') => {
    clearTimeout(timer.current);
    setSnack({ id: Date.now(), message, type });
    timer.current = setTimeout(() => setSnack(null), 4000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      {snack && <Snackbar key={snack.id} message={snack.message} type={snack.type} />}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  return useContext(SnackbarContext);
}

