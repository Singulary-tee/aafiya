import * as Notifications from 'expo-notifications';

export const requestNotificationPermissions = async (promptIfNeeded: boolean = true): Promise<boolean> => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status === 'granted') {
    return true;
  }

  if (!promptIfNeeded || settings.status === 'denied') {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
};
