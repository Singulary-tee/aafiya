/**
 * i18n Configuration
 * Initialize i18next for Arabic and English translations
 */

import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import ar_common from './locales/ar/common.json';
import ar_errors from './locales/ar/errors.json';
import ar_home from './locales/ar/home.json';
import ar_medications from './locales/ar/medications.json';
import ar_notifications from './locales/ar/notifications.json';
import ar_settings from './locales/ar/settings.json';

import en_common from './locales/en/common.json';
import en_errors from './locales/en/errors.json';
import en_home from './locales/en/home.json';
import en_medications from './locales/en/medications.json';
import en_notifications from './locales/en/notifications.json';
import en_settings from './locales/en/settings.json';

// Detect device language
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
const isArabic = deviceLanguage.startsWith('ar');

// Set RTL for Arabic
if (isArabic) {
  I18nManager.forceRTL(true);
}

const resources = {
  ar: {
    common: ar_common,
    home: ar_home,
    medications: ar_medications,
    settings: ar_settings,
    errors: ar_errors,
    notifications: ar_notifications,
  },
  en: {
    common: en_common,
    home: en_home,
    medications: en_medications,
    settings: en_settings,
    errors: en_errors,
    notifications: en_notifications,
  },
};

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
