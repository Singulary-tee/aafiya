
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useHelperMode } from '@/src/hooks/useHelperMode';
import { HelperStatusCard } from '@/src/components/helper/HelperStatusCard';
import { useProfile } from '@/src/hooks/useProfile';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import Button from '@/src/components/common/Button';

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
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.fontSizes.title,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.subheading,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
});
