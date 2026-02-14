
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/src/constants/colors';
import { SPACING } from '@/src/constants/spacing';
import Card from '@/src/components/common/Card';
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
      color: COLORS.textSecondary,
    },
    pending: {
      text: t('status_pending'),
      color: COLORS.attention,
    },
    paired: {
      text: t('status_paired'),
      color: COLORS.healthy,
    },
  };

  const config = statusConfig[status];

  return (
    <Card style={styles.container}>
      <View style={[styles.statusIndicator, { backgroundColor: config.color }]} />
      <Text style={{ color: config.color }}>{config.text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
});
