/**
 * i18n Configuration
 * Initialize i18next for Arabic and English translations
 */

import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import { resources } from './resources';

// Detect device language
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
const isArabic = deviceLanguage.startsWith('ar');

// Set RTL for Arabic
if (isArabic) {
  I18nManager.forceRTL(true);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: isArabic ? 'ar' : 'en',
    defaultNS: 'common',
    ns: ['common', 'home', 'medications', 'settings', 'errors', 'notifications'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
