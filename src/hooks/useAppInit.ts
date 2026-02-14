
import { useEffect, useState } from 'react';
import { useAppFonts } from '@/src/hooks/useAppFonts';
import { useFontSettings } from '@/src/hooks/useFontSettings';
import { i18nInitialization } from '@/src/i18n';

export const useAppInit = () => {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const fontsLoaded = useAppFonts();
  const { isFontSettingLoaded } = useFontSettings();

  useEffect(() => {
    i18nInitialization.then(() => {
      setIsI18nInitialized(true);
    });
  }, []);

  const isInitialized = isI18nInitialized && fontsLoaded && isFontSettingLoaded;

  return { isInitialized };
};
