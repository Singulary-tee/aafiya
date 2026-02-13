
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '@/src/constants/colors';
import { SPACING } from '@/src/constants/spacing';
import Card from '@/src/components/common/Card';

type HelperStatus = 'unpaired' | 'pending' | 'paired';

interface HelperStatusCardProps {
  status: HelperStatus;
}

const statusConfig = {
  unpaired: {
    text: 'Not Paired with a Helper',
    color: COLORS.textSecondary,
  },
  pending: {
    text: 'Pairing Request Pending',
    color: COLORS.attention,
  },
  paired: {
    text: 'Paired with a Helper',
    color: COLORS.healthy,
  },
};

export function HelperStatusCard({ status }: HelperStatusCardProps) {
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
