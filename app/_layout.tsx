
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useProfile, ProfileProvider } from '@/src/hooks/useProfile';
import { DatabaseProvider } from '@/src/hooks/useDatabase';
import { ActivityIndicator } from 'react-native';
import { i18nInitialization } from '@/src/i18n';
import { useTranslation } from 'react-i18next';

const AppLayout = () => {
  const { activeProfile, isLoading: isProfileLoading } = useProfile();
  const router = useRouter();
  const segments = useSegments();
  const { t } = useTranslation(['profiles', 'medications']);
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    i18nInitialization.then(() => {
      setIsI18nInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (isProfileLoading || !isI18nInitialized) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const currentRoute = segments.join('/');
    const protectedRoutes = ['medications/add']; // Routes accessible only when logged in

    if (activeProfile && !inTabsGroup && !protectedRoutes.includes(currentRoute)) {
      router.replace('/(tabs)');
    } else if (!activeProfile && inTabsGroup) {
      router.replace('/profiles/select');
    }
  }, [activeProfile, isProfileLoading, isI18nInitialized, segments, router]);

  if (isProfileLoading || !isI18nInitialized) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profiles/select" options={{ title: t('profiles:select_profile') }} />
      <Stack.Screen name="profiles/create" options={{ title: t('profiles:create_profile') }} />
      <Stack.Screen name="medications/add" options={{ title: t('medications:add_medication') }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <ProfileProvider>
        <AppLayout />
      </ProfileProvider>
    </DatabaseProvider>
  );
}
