import * as Font from 'expo-font';
import { useState, useEffect } from 'react';

const customFonts = {
  'Inter-Regular': require('../../assets/fonts/Inter_18pt-Regular.ttf'),
  'Inter-Bold': require('../../assets/fonts/Inter_18pt-Bold.ttf'),
  'Cairo-Regular': require('../../assets/fonts/Cairo-Regular.ttf'),
  'Cairo-Bold': require('../../assets/fonts/Cairo-Bold.ttf'),
};

export const useAppFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(customFonts);
      } catch (e) {
        console.warn('Error loading custom fonts:', e);
      } finally {
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  return fontsLoaded;
};
