import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GradientBackground } from '@/src/components/primitives/GradientBackground';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

interface CustomSplashScreenProps {
  isReady: boolean;
}

/**
 * CustomSplashScreen - Brand splash screen with gradient background
 * Shows while app is initializing, then fades out
 */
export const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ isReady }) => {
  const [isSplashReady, setIsSplashReady] = React.useState(false);

  useEffect(() => {
    if (isReady && isSplashReady) {
      // Hide native splash and show our custom one
      SplashScreen.hideAsync();
    }
  }, [isReady, isSplashReady]);

  useEffect(() => {
    // Mark splash as ready after a short delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsSplashReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isReady && isSplashReady) {
    return null;
  }

  return (
    <GradientBackground 
      gradient="BRAND_SUBTLE"
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
