# Theme System Documentation

## Overview

The Aafiya app uses a centralized theme system with a glassy, modern aesthetic featuring blue-ish and purple-ish brand colors. This document describes the theme structure and how to use it.

## Brand Identity

### Color Palette

**Primary Brand Colors:**
- Primary Blue: `#21AFF7` - Main brand color
- Primary Purple: `#7B68EE` - Secondary brand color
- Accent Orange: `#FF9800` - Call-to-action highlights

**Gradients:**
- `BRAND_PRIMARY`: Blue to Purple gradient (main brand gradient)
- `BRAND_SECONDARY`: Lighter blue to purple
- `BRAND_SUBTLE`: Very light gradient for backgrounds
- `SPLASH`: Splash screen gradient
- `GLASS_OVERLAY`: Semi-transparent gradient for glass effects

### Glass Effect

The glass aesthetic is achieved through:
- Semi-transparent backgrounds (`rgba` colors)
- Subtle borders with low opacity
- Custom shadow with primary color tint
- Soft border radius for modern look

## Usage

### Importing Theme

```typescript
import { theme } from '@/src/constants/theme';
```

### Using Colors

```typescript
// Direct color usage
backgroundColor: theme.colors.primary
color: theme.colors.textPrimary

// Semantic colors
backgroundColor: theme.colors.success  // Green
backgroundColor: theme.colors.warning  // Yellow
backgroundColor: theme.colors.error    // Red
```

### Using Spacing

```typescript
// Spacing scale: xs, sm, md, lg, xl, xxl
padding: theme.spacing.md        // 16px
marginTop: theme.spacing.lg      // 24px
gap: theme.spacing.sm            // 8px
```

### Using Shadows

```typescript
// Pre-defined shadow styles
...theme.shadows.subtle   // Soft shadow
...theme.shadows.medium   // Medium shadow
...theme.shadows.strong   // Strong shadow
...theme.shadows.glass    // Glass effect shadow with brand color tint
```

### Using Border Radius

```typescript
borderRadius: theme.radii.xs   // 4px
borderRadius: theme.radii.sm   // 8px
borderRadius: theme.radii.md   // 12px
borderRadius: theme.radii.lg   // 16px
borderRadius: theme.radii.xl   // 20px
borderRadius: theme.radii.full // 9999px (circular)
```

## Components

### Primitive Components

#### Box
Theme-aware View component with shorthand props:

```typescript
import { Box } from '@/src/components/primitives';

<Box 
  p="md" 
  bg={theme.colors.surface} 
  borderRadius="lg"
  shadow="subtle"
>
  <Text>Content</Text>
</Box>
```

#### GradientBackground
Gradient background component:

```typescript
import { GradientBackground } from '@/src/components/primitives';

<GradientBackground gradient="BRAND_PRIMARY">
  <Text>Content with gradient background</Text>
</GradientBackground>
```

### Common Components

#### GlassCard
Card with glass aesthetic:

```typescript
import { GlassCard } from '@/src/components/common';

<GlassCard variant="surface" shadow="glass">
  <Text>Content in glass card</Text>
</GlassCard>
```

Variants:
- `default`: Standard glass background
- `surface`: White glass surface
- `overlay`: Lighter overlay

#### GradientButton
Button with optional gradient:

```typescript
import { GradientButton } from '@/src/components/common';

<GradientButton 
  title="Save" 
  onPress={handleSave} 
  variant="gradient" 
/>
```

Variants:
- `primary`: Solid primary color
- `secondary`: Solid secondary color
- `tertiary`: Transparent with border
- `gradient`: Brand gradient

## Theme Utilities

```typescript
import { getColor, glassEffect, cardStyle, textStyle } from '@/src/constants/themeUtils';

// Get color with opacity
const semiTransparent = getColor('primary', 0.5);

// Create glass effect
const glass = glassEffect('light');

// Create card style
const elevated = cardStyle('elevated');

// Create text style
const heading = textStyle('headline', 'bold', 'textPrimary');
```

## Best Practices

1. **Always use theme colors** - Never hardcode color values
2. **Use spacing scale** - Use theme.spacing for consistent spacing
3. **Prefer GlassCard** - Use GlassCard over Card for modern look
4. **Use gradients sparingly** - Reserve gradients for key UI elements
5. **Maintain opacity consistency** - Use theme glass colors for transparency
6. **Test both light and dark** - Ensure theme works in both modes (future)

## Migration Guide

### From Old to New Theme

**Before:**
```typescript
backgroundColor: '#FFFFFF'
padding: 16
borderRadius: 8
```

**After:**
```typescript
backgroundColor: theme.colors.surface
padding: theme.spacing.md
borderRadius: theme.radii.md
```

### Using GlassCard Instead of Card

**Before:**
```typescript
<Card style={styles.card}>
  <Text>Content</Text>
</Card>
```

**After:**
```typescript
<GlassCard variant="surface" shadow="glass">
  <Text>Content</Text>
</GlassCard>
```

## Future Enhancements

- Dark mode support with theme switching
- Accessibility color contrast validation
- Theme customization per user preference
- Animated gradient backgrounds
- More gradient variants
