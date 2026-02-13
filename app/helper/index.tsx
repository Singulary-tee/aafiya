
import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useHelperMode } from '@/src/hooks/useHelperMode';
import { HelperStatusCard } from '@/src/components/helper/HelperStatusCard';
import { COLORS } from '@/src/constants/colors';
import { useProfile } from '@/src/hooks/useProfile';

export default function HelperModeScreen() {
  const router = useRouter();
  const { activeProfile } = useProfile();
  const { pairing, isPaired } = useHelperMode(activeProfile?.id || '');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Helper Mode</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paired Patients</Text>
        {isPaired && pairing && (
          <HelperStatusCard
            status='paired'
          />
        )}
        {!isPaired && (
          <Text style={styles.emptyText}>No paired patients found.</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Add Patient (Scan QR)"
          onPress={() => router.push('/helper/pair')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
