
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useHelperMode } from '@/src/hooks/useHelperMode';
import HealthCircle from '@/src/components/health/HealthCircle';
import { COLORS } from '@/src/constants/colors';
import { useProfile } from '@/src/hooks/useProfile';

export default function MonitorPatientScreen() {
  const { id } = useLocalSearchParams();
  const { activeProfile } = useProfile();
  const { pairing } = useHelperMode(activeProfile?.id || '');

  if (!pairing) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoring: {pairing.id || 'Patient'}</Text>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.label}>Health Score</Text>
        <HealthCircle score={100} size={150} />
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.label}>Last Sync</Text>
        <Text style={styles.value}>
          {new Date().toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
});
