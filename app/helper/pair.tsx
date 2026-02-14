import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
// import { BarCodeScanner } from 'expo-barcode-scanner'; // This usually needs more setup
import { useHelperMode } from '@/src/hooks/useHelperMode';
import { useProfile } from '@/src/hooks/useProfile';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import Button from '@/src/components/common/Button';

export default function PairHelperScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { activeProfile } = useProfile();
  const { pairWithPrimary } = useHelperMode(activeProfile?.id || '');

  // For a placeholder, we'll just simulate a scan or show a simple UI
  // Real implementation would use expo-barcode-scanner

  const handleSimulateScan = async () => {
    // Simulated pairing data
    const simulatedData = JSON.stringify({
      deviceId: 'simulated-device-id',
      profileId: 'simulated-profile-id',
      encryptionKey: 'simulated-key',
      version: 1,
      timestamp: Date.now()
    });
    
    await pairWithPrimary(simulatedData);
    router.replace('/helper');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Pairing QR Code</Text>
      <View style={styles.scannerPlaceholder}>
        <Text>Camera View Finder Placeholder</Text>
      </View>
      
      <Button title="Simulate Successful Scan" onPress={handleSimulateScan} />
      <Button title="Cancel" onPress={() => router.back()} variant="tertiary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background
  },
  title: {
    fontSize: theme.fontSizes.subheading,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
  },
  scannerPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }
});