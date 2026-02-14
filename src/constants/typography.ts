import { useFontSettings } from '@/src/hooks/useFontSettings';
import { useTranslation } from 'react-i18next';

export const FONT_SIZES = {
  headline: 24,
  title: 20,
  body: 16,
  caption: 14,
  small: 12,
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  bold: '700',
};

export const useCustomFonts = () => {
  const { useCustomFonts: use } = useFontSettings();
  const { i18n } = useTranslation();

  const getFontFamily = (weight: keyof typeof FONT_WEIGHTS) => {
    if (!use) {
      return undefined; // Use system font
    }

    const isArabic = i18n.language === 'ar';
    const fontPrefix = isArabic ? 'Cairo' : 'Inter_18pt';

    switch (weight) {
      case 'bold':
        return `${fontPrefix}-Bold`;
      default:
        return `${fontPrefix}-Regular`;
    }
  };

  return { getFontFamily };
};
