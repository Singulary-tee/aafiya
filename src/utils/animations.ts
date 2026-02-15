import { withSpring, withTiming, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

/**
 * Animation utilities for micro-interactions
 * Using React Native Reanimated
 */

// Spring configuration for natural feel
export const SPRING_CONFIG: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

// Timing configuration for animations
export const TIMING_CONFIG: WithTimingConfig = {
  duration: 250,
};

// Fast timing for quick feedback
export const FAST_TIMING: WithTimingConfig = {
  duration: 200,
};

// Slow timing for smooth transitions
export const SLOW_TIMING: WithTimingConfig = {
  duration: 300,
};

/**
 * Button press animation
 * Scales button to 0.95 on press, springs back to 1.0
 */
export const buttonPressAnimation = {
  pressed: 0.95,
  released: 1.0,
  config: SPRING_CONFIG,
};

/**
 * Fade animation values
 */
export const fadeAnimation = {
  visible: 1,
  hidden: 0,
  duration: 300,
};

/**
 * Slide animation values
 * For card appearance from bottom
 */
export const slideAnimation = {
  start: 50,
  end: 0,
  duration: 300,
};

/**
 * Helper to trigger haptic feedback on button press
 */
export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  switch (type) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
  }
};

/**
 * Animate with spring
 */
export const animateSpring = (value: any, toValue: number) => {
  'worklet';
  return withSpring(toValue, SPRING_CONFIG);
};

/**
 * Animate with timing
 */
export const animateTiming = (value: any, toValue: number, config: WithTimingConfig = TIMING_CONFIG) => {
  'worklet';
  return withTiming(toValue, config);
};
