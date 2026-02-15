import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '@/src/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Skeleton placeholder component for loading states.
 * Shows an animated gray placeholder that pulses.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonListItemProps {
  showImage?: boolean;
}

/**
 * Skeleton for a list item with optional image.
 */
export const SkeletonListItem: React.FC<SkeletonListItemProps> = ({ showImage = true }) => {
  return (
    <View style={styles.listItem}>
      {showImage && <Skeleton width={60} height={60} borderRadius={theme.borderRadius.md} />}
      <View style={styles.listItemContent}>
        <Skeleton width="80%" height={20} style={styles.titleSkeleton} />
        <Skeleton width="60%" height={16} />
      </View>
    </View>
  );
};

/**
 * Skeleton for medication card.
 */
export const SkeletonMedicationCard: React.FC = () => {
  return (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <Skeleton width={60} height={60} borderRadius={theme.borderRadius.lg} />
        <View style={styles.medicationInfo}>
          <Skeleton width="70%" height={20} style={styles.titleSkeleton} />
          <Skeleton width="50%" height={16} style={styles.subtitleSkeleton} />
          <Skeleton width="40%" height={14} />
        </View>
      </View>
      <View style={styles.medicationFooter}>
        <Skeleton width={80} height={32} borderRadius={theme.borderRadius.md} />
        <Skeleton width={80} height={32} borderRadius={theme.borderRadius.md} />
      </View>
    </View>
  );
};

/**
 * Skeleton screen with multiple list items.
 */
export const SkeletonScreen: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View style={styles.screen}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonListItem key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.border,
  },
  listItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listItemContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  titleSkeleton: {
    marginBottom: theme.spacing.xs,
  },
  subtitleSkeleton: {
    marginBottom: theme.spacing.xs,
  },
  medicationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  medicationHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  medicationInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  medicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
