"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { translations, translateText } from '@/lib/translations'

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translate: (text: string) => string;
  toggleLanguage: () => void;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') || false;

  // Initialize lang and dir state on mount and url changes
  useEffect(() => {
    if (isAdmin) {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
      queueMicrotask(() => setLanguageState('ar'));
      return;
    }
    
    // Check URL search parameters first
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang') as Language;
      if (urlLang === 'ar' || urlLang === 'en') {
        localStorage.setItem('vitamins_hub_lang', urlLang);
        document.documentElement.lang = urlLang;
        document.documentElement.dir = urlLang === 'ar' ? 'rtl' : 'ltr';
        queueMicrotask(() => setLanguageState(urlLang));
        return;
      }
    }

    const saved = localStorage.getItem('vitamins_hub_lang') as Language;
    if (saved && (saved === 'ar' || saved === 'en')) {
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      queueMicrotask(() => setLanguageState(saved));
    } else {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  }, [isAdmin, pathname]);

  const setLanguage = (lang: Language) => {
    if (isAdmin) {
      setLanguageState('ar');
      localStorage.setItem('vitamins_hub_lang', 'ar');
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
      return;
    }
    setLanguageState(lang);
    localStorage.setItem('vitamins_hub_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string): string => {
    const activeLang = isAdmin ? 'ar' : language;
    return translations[activeLang]?.[key] || translations['ar']?.[key] || key;
  };

  const translate = (text: string): string => {
    const activeLang = isAdmin ? 'ar' : language;
    return translateText(text, activeLang);
  };

  const dir = isAdmin ? 'rtl' : (language === 'ar' ? 'rtl' : 'ltr');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate, toggleLanguage, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
