
// Border Radius - Single value: 12dp everywhere
export const RADII = {
  standard: 12, // 12dp for everything (cards, buttons, inputs, modals, images)
  full: 9999, // For circular elements
};

// Backward compatibility alias
export const borderRadius = RADII;

// Shadows/Elevation - Two levels only
export const SHADOWS = {
  // Level 1: Subtle shadow for cards and buttons
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  // Level 2: Pronounced shadow for modals and floating actions
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};
