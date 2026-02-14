import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useHelperMode } from '@/src/hooks/useHelperMode';
import { useProfile } from '@/src/hooks/useProfile';
import { PairingQR } from '@/src/components/helper/PairingQR';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import Button from '@/src/components/common/Button';

export default function GenerateQRScreen() {
  const router = useRouter();
  const { activeProfile } = useProfile();
  const { qrCode, generatePairingData } = useHelperMode(activeProfile?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generate = async () => {
      if (!qrCode && !isGenerating) {
        setIsGenerating(true);
        await generatePairingData();
        setIsGenerating(false);
      }
    };
    generate();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Add Helper</Text>
      
      <Text style={styles.instructions}>
        Have your helper scan this QR code with their device to pair and receive notifications when you miss a dose.
      </Text>

      {isGenerating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Generating QR code...</Text>
        </View>
      )}

      {qrCode && !isGenerating && (
        <View style={styles.qrContainer}>
          <PairingQR qrData={qrCode} />
          <Text style={styles.expiryText}>
            This code expires in 10 minutes
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Done" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes.title,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
  },
  instructions: {
    fontSize: theme.fontSizes.body,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  expiryText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.small,
    color: theme.colors.attention,
  },
  buttonContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
});
