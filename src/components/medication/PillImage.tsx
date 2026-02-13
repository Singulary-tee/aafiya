
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/colors';

interface PillImageProps {
  imageUrl?: string;
  size?: number;
}

const PillImage: React.FC<PillImageProps> = ({ imageUrl, size = 60 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={imageUrl ? { uri: imageUrl } : require('../../../assets/images/partial-react-logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default PillImage;
