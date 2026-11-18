import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '../i18n/en';
import hi from '../i18n/hi';
import te from '../i18n/te';
import { getLanguage, saveLanguage } from '../utils/storage';

const STRINGS = { en, hi, te };

export const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'te', label: 'TE' },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    getLanguage().then(code => {
      if (code === 'en' || code === 'hi' || code === 'te') {
        setLanguageState(code);
      }
    });
  }, []);

  const setLanguage = useCallback(code => {
    setLanguageState(code);
    saveLanguage(code);
  }, []);

  const t = useCallback((key, params) => {
    const text = STRINGS[language][key] ?? en[key] ?? key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
    );
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
