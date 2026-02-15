
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
  const { helpers, patients } = useHelperMode(activeProfile?.id || '');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Helper Mode</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Helpers</Text>
        <Text style={styles.sectionDescription}>
          People who can monitor your medication adherence
        </Text>
        {helpers.length > 0 ? (
          helpers.map((helper) => (
            <HelperStatusCard key={helper.id} status='paired' />
          ))
        ) : (
          <Text style={styles.emptyText}>No helpers added yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patients I'm Monitoring</Text>
        <Text style={styles.sectionDescription}>
          People whose medication adherence you monitor
        </Text>
        {patients.length > 0 ? (
          patients.map((patient) => (
            <HelperStatusCard key={patient.id} status='paired' />
          ))
        ) : (
          <Text style={styles.emptyText}>Not monitoring any patients.</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Add Helper (Generate QR)"
          onPress={() => router.push('/helper/generate')}
          style={styles.button}
        />
        <Button
          title="Monitor Patient (Scan QR)"
          onPress={() => router.push('/helper/pair')}
          variant="secondary"
          style={styles.button}
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
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.subheading,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
});
