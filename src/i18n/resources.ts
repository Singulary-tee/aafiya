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

export const resources = {
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
