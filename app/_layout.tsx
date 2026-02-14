
import React from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ProfileProvider, useProfile } from '@/src/hooks/useProfile';
import { DatabaseProvider } from '@/src/hooks/useDatabase';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontSettingsProvider } from '@/src/hooks/useFontSettings';
import { useAppInit } from '@/src/hooks/useAppInit';

const AppLayoutInner = () => {
  const { t } = useTranslation(['profiles', 'medications']);
  const { isInitialized } = useAppInit();
  const { activeProfile, isLoading: isProfileLoading } = useProfile();
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    if (isProfileLoading || !isInitialized) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const onAuthScreens = segments[0] === 'profiles';

    if (activeProfile && onAuthScreens) {
        router.replace('/(tabs)');
    } 
    else if (!activeProfile && !onAuthScreens) {
        router.replace('/profiles/select');
    }
  }, [activeProfile, isProfileLoading, isInitialized, segments]);

  if (!isInitialized || isProfileLoading) {
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

const AppLayout = () => {
    return (
        <FontSettingsProvider>
            <ProfileProvider>
              <AppLayoutInner />
            </ProfileProvider>
        </FontSettingsProvider>
    )
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
        <AppLayout />
    </DatabaseProvider>
  );
}
