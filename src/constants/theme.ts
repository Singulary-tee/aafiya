
import { COLORS } from './colors';
import { SPACING } from './spacing';
import { FONT_SIZES, FONT_WEIGHTS } from './typography';
import { RADII, SHADOWS } from './design';

export const theme = {
  colors: COLORS,
  spacing: SPACING,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  radii: RADII,
  shadows: SHADOWS,
};

export type AppTheme = typeof theme;
