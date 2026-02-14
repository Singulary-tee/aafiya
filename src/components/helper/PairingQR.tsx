
import React from 'react';
import QRCode from 'react-native-qrcode-svg';
import Card from '@/src/components/common/Card';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '@/src/constants/spacing';
import { theme } from '@/src/constants/theme';

interface PairingQRProps {
  qrData: string;
}

export function PairingQR({ qrData }: PairingQRProps) {
  return (
    <Card>
      <View style={styles.container}>
        <QRCode
          value={qrData}
          size={250}
          backgroundColor={theme.colors.surface}
          color={theme.colors.textPrimary}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.md,
  },
});
