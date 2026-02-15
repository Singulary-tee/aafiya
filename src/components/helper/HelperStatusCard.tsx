
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/src/constants/theme';
import { GlassCard } from '@/src/components/common/GlassCard';
import { Text } from '@/src/components/primitives/Text';

type HelperStatus = 'unpaired' | 'pending' | 'paired';

interface HelperStatusCardProps {
  status: HelperStatus;
}

export function HelperStatusCard({ status }: HelperStatusCardProps) {
  const { t } = useTranslation('helper');

  const statusConfig = {
    unpaired: {
      text: t('status_unpaired'),
      color: theme.colors.textSecondary,
    },
    pending: {
      text: t('status_pending'),
      color: theme.colors.warning,
    },
    paired: {
      text: t('status_paired'),
      color: theme.colors.success,
    },
  };

  const config = statusConfig[status];

  return (
    <GlassCard intensity={20} padding="md" elevation="level1" style={styles.container}>
      <View style={[styles.statusIndicator, { backgroundColor: config.color }]} />
      <Text size="medium" style={{ color: config.color }}>{config.text}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: theme.radii.standard,
    height: theme.radii.standard,
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.sm,
  },
});
