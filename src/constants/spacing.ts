/**/**






























































































export default TYPOGRAPHY;} as const;  },    lineHeight: TYPOGRAPHY.lineHeight.tight,    fontWeight: TYPOGRAPHY.fontWeight.normal,    fontSize: TYPOGRAPHY.fontSize.xs,  caption: {  },    lineHeight: TYPOGRAPHY.lineHeight.normal,    fontWeight: TYPOGRAPHY.fontWeight.semibold,    fontSize: TYPOGRAPHY.fontSize.base,  button: {  },    lineHeight: TYPOGRAPHY.lineHeight.normal,    fontWeight: TYPOGRAPHY.fontWeight.medium,    fontSize: TYPOGRAPHY.fontSize.sm,  label: {  },    lineHeight: TYPOGRAPHY.lineHeight.normal,    fontWeight: TYPOGRAPHY.fontWeight.normal,    fontSize: TYPOGRAPHY.fontSize.sm,  bodySmall: {  },    lineHeight: TYPOGRAPHY.lineHeight.normal,    fontWeight: TYPOGRAPHY.fontWeight.normal,    fontSize: TYPOGRAPHY.fontSize.base,  body: {  },    lineHeight: TYPOGRAPHY.lineHeight.normal,    fontWeight: TYPOGRAPHY.fontWeight.semibold,    fontSize: TYPOGRAPHY.fontSize.h3,  h3: {  },    lineHeight: TYPOGRAPHY.lineHeight.tight,    fontWeight: TYPOGRAPHY.fontWeight.bold,    fontSize: TYPOGRAPHY.fontSize.h2,  h2: {  },    lineHeight: TYPOGRAPHY.lineHeight.tight,    fontWeight: TYPOGRAPHY.fontWeight.bold,    fontSize: TYPOGRAPHY.fontSize.h1,  h1: {export const FONT_STYLES = {// Preset font styles} as const;  },    wide: 0.5,    normal: 0,    tight: -0.5,  letterSpacing: {  // Letter spacing  },    loose: 2,    relaxed: 1.75,    normal: 1.5,    tight: 1.2,  lineHeight: {  // Line heights  },    extrabold: '800',    bold: '700',    semibold: '600',    medium: '500',    normal: '400',    light: '300',  fontWeight: {  // Font weights  },    h6: 16,    h5: 18,    h4: 20,    h3: 24,    h2: 28,    h1: 32,    xxxl: 28,    xxl: 24,    xl: 20,    lg: 18,    base: 16,    sm: 14,    xs: 12,  fontSize: {  // Font sizesexport const TYPOGRAPHY = { */ * Font sizes, weights, and line heights * Typography * Spacing System
 * Consistent spacing scale based on 4sp base unit
 */

export const SPACING = {
  // Base units (4sp)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Larger spacing
  huge: 40,
  massive: 48,
  
  // Common aliases
  gap: 8,
  padding: 16,
  margin: 16,
  borderRadius: 8,
  borderRadiusLarge: 12,
  borderRadiusXL: 16,
  
  // Touch targets (minimum 44x44 for accessibility)
  touchTarget: 44,
} as const;

export default SPACING;
