'use client';

import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18n
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    supportedLngs: ['en', 'ar', 'fr'],
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
  });

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}