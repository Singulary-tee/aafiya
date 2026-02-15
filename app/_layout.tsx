
import { DoseLogRepository } from '@/src/database/repositories/DoseLogRepository';
import { useAppInit } from '@/src/hooks/useAppInit';
import { DatabaseProvider, useDatabase } from '@/src/hooks/useDatabase';
import { FontSettingsProvider } from '@/src/hooks/useFontSettings';
import { ProfileProvider, useProfile } from '@/src/hooks/useProfile';
import { registerMissedDoseBackgroundTask } from '@/src/services/notification/MissedDoseTask';
import { NotificationHandler } from '@/src/services/notification/NotificationHandler';
import { requestNotificationPermissions } from '@/src/services/notification/NotificationPermissions';
import { NotificationScheduler } from '@/src/services/notification/NotificationScheduler';
import { getData, storeData } from '@/src/utils/storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { CustomSplashScreen } from '@/src/components/common/CustomSplashScreen';

const AppLayoutInner = () => {
  const { t } = useTranslation(['profiles', 'medications']);
  const { isInitialized } = useAppInit();
  const { activeProfile, isLoading: isProfileLoading } = useProfile();
  const { db, isLoading: isDbLoading } = useDatabase();
  const router = useRouter();
  const segments = useSegments();
  const notificationHandlerRef = React.useRef<NotificationHandler | null>(null);
  const notificationPromptRef = React.useRef(false);
  const missedDoseTaskRef = React.useRef(false);

  const NOTIFICATION_PROMPT_KEY = 'notification_permission_prompted';

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

  React.useEffect(() => {
    if (isDbLoading || !db || notificationHandlerRef.current) return;

    NotificationScheduler.configureNotificationCategories().catch((error) => {
      console.warn('Failed to configure notification categories:', error);
    });

    const doseLogRepository = new DoseLogRepository(db);
    notificationHandlerRef.current = new NotificationHandler(doseLogRepository);
  }, [db, isDbLoading]);

  React.useEffect(() => {
    if (notificationPromptRef.current || !isInitialized || isProfileLoading || !activeProfile) return;

    const promptNotifications = async () => {
      const prompted = await getData(NOTIFICATION_PROMPT_KEY);
      if (prompted) {
        notificationPromptRef.current = true;
        return;
      }

      notificationPromptRef.current = true;
      const granted = await requestNotificationPermissions(true);
      await storeData(NOTIFICATION_PROMPT_KEY, { promptedAt: Date.now(), granted });
    };

    promptNotifications().catch((error) => {
      console.warn('Failed to request notification permissions:', error);
    });
  }, [activeProfile, isInitialized, isProfileLoading]);

  React.useEffect(() => {
    if (missedDoseTaskRef.current || isDbLoading || !db) return;
    missedDoseTaskRef.current = true;

    registerMissedDoseBackgroundTask().catch((error) => {
      console.warn('Failed to register missed dose background task:', error);
    });
  }, [db, isDbLoading]);

  if (!isInitialized || isProfileLoading) {
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profiles/select" options={{ title: t('profiles:select_profile') }} />
        <Stack.Screen name="profiles/create" options={{ title: t('profiles:create_profile') }} />
        <Stack.Screen name="medications/add" options={{ title: t('medications:add_medication') }} />
      </Stack>
    </>
  );
};

const AppLayout = () => {
    return (
        <ProfileProvider>
            <AppLayoutInner />
        </ProfileProvider>
    )
}

const AppContent = () => {
  const { isInitialized } = useAppInit();
  
  return (
    <>
      <AppLayout />
      <CustomSplashScreen isReady={isInitialized} />
    </>
  );
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
        <FontSettingsProvider>
            <AppContent />
        </FontSettingsProvider>
    </DatabaseProvider>
  );
}
