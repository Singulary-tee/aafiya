
import { getData, storeData } from '../utils/storage';

const LANGUAGE_KEY = 'user-language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    const savedLanguage = await getData(LANGUAGE_KEY);
    if (savedLanguage) {
      callback(savedLanguage);
    } else {
      // Fallback to a default language if none is saved
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    await storeData(LANGUAGE_KEY, language);
  },
};

export default languageDetector;
