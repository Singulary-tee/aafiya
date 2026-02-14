import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useHelperMode } from '@/src/hooks/useHelperMode';
import { useProfile } from '@/src/hooks/useProfile';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import Button from '@/src/components/common/Button';

export default function PairHelperScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { activeProfile } = useProfile();
  const { pairWithPrimary } = useHelperMode(activeProfile?.id || '');

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      await pairWithPrimary(data);
      Alert.alert('Success', 'Successfully paired with patient!', [
        { text: 'OK', onPress: () => router.replace('/helper') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to pair. Please try again.', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.message}>
          Camera access is needed to scan the QR code for pairing.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
        <Button title="Cancel" onPress={() => router.back()} variant="tertiary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Pairing QR Code</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
      </View>
      <Text style={styles.instructions}>
        Point your camera at the QR code displayed on the patient's device
      </Text>
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
  message: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  cameraContainer: {
    width: 300,
    height: 300,
    borderRadius: theme.spacing.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  camera: {
    flex: 1,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textSecondary,
  }
});