import arCommon from './locales/ar/common.json';
import arHome from './locales/ar/home.json';
import arMedications from './locales/ar/medications.json';
import arSettings from './locales/ar/settings.json';
import arErrors from './locales/ar/errors.json';
import arNotifications from './locales/ar/notifications.json';
import arProfiles from './locales/ar/profiles.json';
import arHelper from './locales/ar/helper.json';

import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enMedications from './locales/en/medications.json';
import enSettings from './locales/en/settings.json';
import enErrors from './locales/en/errors.json';
import enNotifications from './locales/en/notifications.json';
import enProfiles from './locales/en/profiles.json';
import enHelper from './locales/en/helper.json';


const resources = {
  ar: {
    common: arCommon,
    home: arHome,
    medications: arMedications,
    settings: arSettings,
    errors: arErrors,
    notifications: arNotifications,
    profiles: arProfiles,
    helper: arHelper,
  },
  en: {
    common: enCommon,
    home: enHome,
    medications: enMedications,
    settings: enSettings,
    errors: enErrors,
    notifications: enNotifications,
    profiles: enProfiles,
    helper: enHelper,
  },
} as const;

export default resources;
