
import { COLORS, GRADIENTS } from './colors';
import { SPACING } from './spacing';
import { FONT_SIZES, FONT_WEIGHTS } from './typography';
import { RADII, SHADOWS, borderRadius } from './design';

export const theme = {
  colors: COLORS,
  gradients: GRADIENTS,
  spacing: SPACING,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  radii: RADII,
  borderRadius, // Backward compatibility
  shadows: SHADOWS,
};

export type AppTheme = typeof theme;
