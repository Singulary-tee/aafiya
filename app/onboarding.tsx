import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding from '@/src/components/onboarding/Onboarding';
import { theme } from '@/src/constants/theme';
import { useTranslation } from 'react-i18next';
import { ONBOARDING_COMPLETED_KEY } from '@/src/constants/storageKeys';

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation(['common']);

  const slides = [
    {
      icon: 'shield-checkmark' as const,
      title: 'Privacy First, Always',
      description: 'Your health data stays on your device. We never collect, track, or share your information. Complete offline functionality means you\'re always in control.',
      iconColor: theme.colors.primary,
    },
    {
      icon: 'notifications-outline' as const,
      title: 'Never Miss a Dose',
      description: 'Smart medication reminders keep you on track. Schedule doses at specific times or intervals, with customizable grace periods.',
      iconColor: theme.colors.success,
    },
    {
      icon: 'people-outline' as const,
      title: 'Family Helper Mode',
      description: 'Connect with family or caregivers via local WiFi. They receive alerts if you miss a dose, all while keeping your data secure and private.',
      iconColor: theme.colors.warning,
    },
  ];

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      router.replace('/(tabs)/');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      router.replace('/(tabs)/');
    }
  };

  return (
    <View style={styles.container}>
      <Onboarding slides={slides} onComplete={handleComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
