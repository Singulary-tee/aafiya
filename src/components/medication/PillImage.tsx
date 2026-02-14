
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { theme } from '../../constants/theme';

interface PillImageProps {
  imageUrl?: string;
  size?: number;
}

const PillImage: React.FC<PillImageProps> = ({ imageUrl, size = 60 }) => {
  const defaultPillSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#AAB8C2" width="100px" height="100px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      ) : (
        <SvgXml
          xml={defaultPillSvg}
          width={size}
          height={size}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default PillImage;
