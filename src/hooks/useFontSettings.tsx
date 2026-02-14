import { createContext, useContext, useState, useEffect } from 'react';
import { storeData, getData } from '@/src/utils/storage';

const FONT_SETTING_KEY = 'useCustomFonts';

interface FontSettingsContextType {
  useCustomFonts: boolean;
  setUseCustomFonts: (value: boolean) => void;
  isFontSettingLoaded: boolean;
}

const FontSettingsContext = createContext<FontSettingsContextType | undefined>(
  undefined
);

export const FontSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [useCustomFonts, setUseCustomFonts] = useState(true);
  const [isFontSettingLoaded, setIsFontSettingLoaded] = useState(false);

  useEffect(() => {
    const loadSetting = async () => {
      const storedSetting = await getData(FONT_SETTING_KEY);
      if (storedSetting !== null) {
        setUseCustomFonts(storedSetting);
      }
      setIsFontSettingLoaded(true);
    };

    loadSetting();
  }, []);

  const handleSetUseCustomFonts = (value: boolean) => {
    setUseCustomFonts(value);
    storeData(FONT_SETTING_KEY, value);
  };

  return (
    <FontSettingsContext.Provider
      value={{
        useCustomFonts,
        setUseCustomFonts: handleSetUseCustomFonts,
        isFontSettingLoaded,
      }}
    >
      {children}
    </FontSettingsContext.Provider>
  );
};

export const useFontSettings = () => {
  const context = useContext(FontSettingsContext);
  if (context === undefined) {
    throw new Error('useFontSettings must be used within a FontSettingsProvider');
  }
  return context;
};
