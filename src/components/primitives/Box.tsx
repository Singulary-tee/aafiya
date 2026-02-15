import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { theme } from '@/src/constants/theme';

interface BoxProps extends Omit<ViewProps, 'style'> {
  // Spacing props
  p?: keyof typeof theme.spacing;
  px?: keyof typeof theme.spacing;
  py?: keyof typeof theme.spacing;
  pt?: keyof typeof theme.spacing;
  pb?: keyof typeof theme.spacing;
  pl?: keyof typeof theme.spacing;
  pr?: keyof typeof theme.spacing;
  m?: keyof typeof theme.spacing;
  mx?: keyof typeof theme.spacing;
  my?: keyof typeof theme.spacing;
  mt?: keyof typeof theme.spacing;
  mb?: keyof typeof theme.spacing;
  ml?: keyof typeof theme.spacing;
  mr?: keyof typeof theme.spacing;
  
  // Color props
  bg?: string;
  backgroundColor?: string;
  
  // Border props
  borderRadius?: keyof typeof theme.radii;
  borderColor?: string;
  borderWidth?: number;
  
  // Shadow props
  shadow?: keyof typeof theme.shadows;
  
  // Flex props
  flex?: number;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: ViewStyle['justifyContent'];
  alignItems?: ViewStyle['alignItems'];
  gap?: keyof typeof theme.spacing;
  
  // Additional style
  style?: ViewStyle;
}

/**
 * Box - Enhanced primitive View component with theme-aware props
 * Provides shorthand props for common styling needs
 * 
 * @example
 * <Box p="md" bg={theme.colors.surface} borderRadius="lg">
 *   <Text>Content</Text>
 * </Box>
 */
export const Box: React.FC<BoxProps> = ({
  // Spacing
  p, px, py, pt, pb, pl, pr,
  m, mx, my, mt, mb, ml, mr,
  
  // Color
  bg, backgroundColor,
  
  // Border
  borderRadius, borderColor, borderWidth,
  
  // Shadow
  shadow,
  
  // Flex
  flex, flexDirection, justifyContent, alignItems, gap,
  
  // Rest
  style,
  children,
  ...props
}) => {
  const boxStyle: ViewStyle = {
    // Padding
    ...(p !== undefined && { padding: theme.spacing[p] }),
    ...(px !== undefined && { paddingHorizontal: theme.spacing[px] }),
    ...(py !== undefined && { paddingVertical: theme.spacing[py] }),
    ...(pt !== undefined && { paddingTop: theme.spacing[pt] }),
    ...(pb !== undefined && { paddingBottom: theme.spacing[pb] }),
    ...(pl !== undefined && { paddingLeft: theme.spacing[pl] }),
    ...(pr !== undefined && { paddingRight: theme.spacing[pr] }),
    
    // Margin
    ...(m !== undefined && { margin: theme.spacing[m] }),
    ...(mx !== undefined && { marginHorizontal: theme.spacing[mx] }),
    ...(my !== undefined && { marginVertical: theme.spacing[my] }),
    ...(mt !== undefined && { marginTop: theme.spacing[mt] }),
    ...(mb !== undefined && { marginBottom: theme.spacing[mb] }),
    ...(ml !== undefined && { marginLeft: theme.spacing[ml] }),
    ...(mr !== undefined && { marginRight: theme.spacing[mr] }),
    
    // Color
    ...(bg && { backgroundColor: bg }),
    ...(backgroundColor && { backgroundColor }),
    
    // Border
    ...(borderRadius !== undefined && { borderRadius: theme.radii[borderRadius] }),
    ...(borderColor && { borderColor }),
    ...(borderWidth !== undefined && { borderWidth }),
    
    // Shadow
    ...(shadow && theme.shadows[shadow]),
    
    // Flex
    ...(flex !== undefined && { flex }),
    ...(flexDirection && { flexDirection }),
    ...(justifyContent && { justifyContent }),
    ...(alignItems && { alignItems }),
    ...(gap !== undefined && { gap: theme.spacing[gap] }),
  };

  return (
    <View style={[boxStyle, style]} {...props}>
      {children}
    </View>
  );
};
