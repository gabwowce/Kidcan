// src/context/LanguageContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

type Lang = 'en' | 'lt';

type LanguageContextValue = {
  language: Lang;
  setLanguage: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
});

const LANG_KEY = 'kidcan_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Lang>('en');

  // load iš AsyncStorage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (saved === 'en' || saved === 'lt') {
          setLanguageState(saved);
          i18n.changeLanguage(saved);
        }
      } catch (e) {
        console.log('Failed to load language', e);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = (lang: Lang) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    AsyncStorage.setItem(LANG_KEY, lang).catch(e =>
      console.log('Failed to save language', e),
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
