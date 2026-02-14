
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Medication } from '@/src/database/models/Medication';
import { Text } from '@/src/components/primitives/Text';
import Card from '@/src/components/common/Card';
import { theme } from '@/src/constants/theme';

interface MedicationListItemProps {
  item: Medication;
  onPress: () => void;
}

const MedicationListItem: React.FC<MedicationListItemProps> = ({ item, onPress }) => {
  return (
    <Card style={styles.card}>
        <TouchableOpacity onPress={onPress} >
            <View style={styles.medicationItem}>
                <View>
                    <Text size="body" weight="bold" style={styles.medicationName}>{item.name}</Text>
                    <Text size="caption" style={styles.medicationStrength}>{item.strength}</Text>
                </View>
                <Text size="body" weight="bold">{item.current_count}</Text>
            </View>
        </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: theme.spacing.sm,
    },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  medicationName: {
    marginBottom: theme.spacing.xs,
  },
  medicationStrength: {
    color: theme.colors.textSecondary,
  },
});

export default MedicationListItem;
