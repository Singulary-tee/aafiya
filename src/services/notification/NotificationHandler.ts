import * as Notifications from 'expo-notifications';

/**
 * NotificationHandler
 * Handles user interactions with notifications.
 */
export class NotificationHandler {

    /**
     * Initializes the notification handler.
     */
    initialize(): void {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });

        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response received:', response);
            // TODO: Implement logic to handle the notification response,
            // e.g., navigate to the medication details screen.
        });

        // TODO: Figure out how to properly clean up this subscription.
        // Since this is a service, there is no component lifecycle to hook into.
    }
}
