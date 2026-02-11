
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Medication } from '@/database/models/Medication';

interface DoseCardProps {
  medication: Medication;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  onTake: () => void;
  onSkip: () => void;
}

const getStatusStyle = (status: DoseCardProps['status']) => {
  switch (status) {
    case 'taken':
      return { barColor: '#4CAF50', contentStyle: { opacity: 0.5 } };
    case 'missed':
      return { barColor: '#F44336', contentStyle: {} };
    case 'skipped':
      return { barColor: '#FF9800', contentStyle: { opacity: 0.7 } };
    case 'pending':
    default:
      return { barColor: '#2196F3', contentStyle: {} };
  }
};

export function DoseCard({ medication, scheduledTime, status, onTake, onSkip }: DoseCardProps) {
  const { barColor, contentStyle } = getStatusStyle(status);

  return (
    <ThemedView style={[styles.card, contentStyle]}>
      <View style={[styles.statusIndicator, { backgroundColor: barColor }]} />
      <View style={styles.contentContainer}>
        <ThemedText style={styles.medicationName}>{`${medication.name} ${medication.strength}`}</ThemedText>
        <ThemedText style={styles.scheduledTime}>{scheduledTime}</ThemedText>
      </View>
      {status === 'pending' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={onTake} style={styles.actionButton}>
            <ThemedText style={styles.actionTextTake}>Take</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSkip} style={styles.actionButton}>
            <ThemedText style={styles.actionTextSkip}>Skip</ThemedText>
          </TouchableOpacity>
        </View>
      )}
      {status !== 'pending' && (
         <ThemedText style={styles.statusText}>{status.charAt(0).toUpperCase() + status.slice(1)}</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 80,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    // Elevation from blueprint
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#FFFFFF', // Default background for ThemedView
  },
  statusIndicator: {
    width: 6,
    height: '100%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduledTime: {
    fontSize: 14,
    color: '#757575',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionTextTake: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionTextSkip: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusText: {
      paddingRight: 16,
      fontSize: 16,
      fontWeight: 'bold',
      fontStyle: 'italic'
  }
});
