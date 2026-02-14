
import { useTranslation } from 'react-i18next';
import { I18nManager, DevSettings } from 'react-native';
import languageDetector from '@/src/i18n/languageDetector';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    if (i18n.language === lng) return;

    // Cache the selected language
    languageDetector.cacheUserLanguage(lng);

    // Set the layout direction
    const isRTL = lng === 'ar';
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);

    // Reload the app to apply changes
    DevSettings.reload();
  };

  return { currentLanguage: i18n.language, changeLanguage };
};
