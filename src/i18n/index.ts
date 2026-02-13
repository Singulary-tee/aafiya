
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import resources from './resources';
import languageDetector from './languageDetector';

const initializeI18n = async () => {
  const lng = await new Promise<string>((resolve) => {
    languageDetector.detect((detectedLng) => {
      resolve(detectedLng);
    });
  });

  const isRTL = lng === 'ar';
  I18nManager.forceRTL(isRTL);
  I18nManager.allowRTL(isRTL);

  await i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng,
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common', 'home', 'medications', 'settings', 'errors', 'notifications', 'profiles'],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
};

export const i18nInitialization = initializeI18n();

export default i18n;
