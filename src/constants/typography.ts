import { useFontSettings } from '@/src/hooks/useFontSettings';
import { useTranslation } from 'react-i18next';

// Typography - Three sizes only as per brand guidelines
export const FONT_SIZES = {
  large: 24, // 24sp for screen titles
  medium: 16, // 16sp for body text and buttons
  small: 14, // 14sp for labels and captions
};

export const FONT_WEIGHTS = {
  regular: '400' as const,
  bold: '700' as const,
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
