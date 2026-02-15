import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
  const [translations, setTranslations] = useState<{ [key: string]: { [key: string]: string } }>({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Use root level paths for translation files
        const enResponse = await fetch('/en.json');
        const hiResponse = await fetch('/hi.json');
        
        if (!enResponse.ok || !hiResponse.ok) {
            throw new Error('Network response was not ok for translation files.');
        }

        const en = await enResponse.json();
        const hi = await hiResponse.json();
        
        setTranslations({ en, hi });
      } catch (error) {
        console.error("Could not load translation files:", error);
      }
    };

    loadTranslations();
  }, []);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};