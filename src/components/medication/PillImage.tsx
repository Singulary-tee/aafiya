
import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
import { theme } from '../../constants/theme';
import { Text } from '../primitives/Text';

interface PillImageProps {
  imageUrl?: string;
  size?: number;
  medicationName?: string;
}

const PillImage: React.FC<PillImageProps> = ({ imageUrl, size = 60, medicationName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [cachedUri, setCachedUri] = useState<string | null>(null);

  const defaultPillSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#AAB8C2" width="100px" height="100px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`;

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    let mounted = true;
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        // Timeout after 5 seconds
        setLoading(false);
        setError(true);
      }
    }, 5000);

    const loadImage = async () => {
      try {
        // Check if image is already cached
        const cacheDir = `${FileSystem.cacheDirectory}pill-images/`;
        const filename = imageUrl.split('/').pop() || 'image.jpg';
        const cachedPath = `${cacheDir}${filename}`;

        // Check if cached file exists
        const fileInfo = await FileSystem.getInfoAsync(cachedPath);
        
        if (fileInfo.exists) {
          // Use cached image
          if (mounted) {
            setCachedUri(cachedPath);
          }
        } else {
          // Download and cache
          setLoading(true);
          
          // Ensure cache directory exists
          const dirInfo = await FileSystem.getInfoAsync(cacheDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
          }

          // Download image
          const downloadResult = await FileSystem.downloadAsync(imageUrl, cachedPath);
          
          if (mounted && downloadResult.status === 200) {
            setCachedUri(downloadResult.uri);
            setLoading(false);
          } else {
            throw new Error('Download failed');
          }
        }
      } catch (err) {
        console.error('Failed to load pill image:', err);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [imageUrl]);

  const renderPlaceholder = () => (
    <View style={styles.placeholderContainer}>
      <SvgXml xml={defaultPillSvg} width={size * 0.6} height={size * 0.6} />
      {medicationName && size > 80 && (
        <Text size="small" style={styles.placeholderText} numberOfLines={2}>
          {medicationName}
        </Text>
      )}
    </View>
  );

  const renderImage = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }

    if (error || !cachedUri) {
      return renderPlaceholder();
    }

    return (
      <Image
        source={{ uri: cachedUri }}
        style={{ width: size, height: size }}
        resizeMode="contain"
        onError={() => setError(true)}
      />
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {imageUrl ? renderImage() : renderPlaceholder()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  placeholderText: {
    marginTop: 4,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
});

export default PillImage;
