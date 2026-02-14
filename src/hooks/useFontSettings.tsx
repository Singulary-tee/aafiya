import { createContext, useContext, useState, useEffect } from 'react';
import { setData, getData } from '@/src/utils/storage';

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
        setUseCustomFonts(JSON.parse(storedSetting));
      }
      setIsFontSettingLoaded(true);
    };

    loadSetting();
  }, []);

  const handleSetUseCustomFonts = (value: boolean) => {
    setUseCustomFonts(value);
    setData(FONT_SETTING_KEY, JSON.stringify(value));
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
