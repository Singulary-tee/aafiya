
import * as Notifications from 'expo-notifications';
import { DoseLogRepository } from '../../database/repositories/DoseLogRepository';
import { logger } from '../../utils/logger';

const NOTIFICATION_CATEGORY_ID = 'medication-reminder';
const ACTION_MARK_AS_TAKEN = 'mark-as-taken';
const ACTION_SKIP = 'skip';

/**
 * Handles incoming notifications and user interactions with them.
 */
export class NotificationHandler {
    private doseLogRepository: DoseLogRepository;

    constructor(doseLogRepository: DoseLogRepository) {
        this.doseLogRepository = doseLogRepository;
        this.initialize();
    }

    /**
     * Sets up the notification handler and response listener.
     */
    private initialize(): void {
        // Define notification behavior
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });

        // Define notification category with actions
        Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY_ID, [
            {
                identifier: ACTION_MARK_AS_TAKEN,
                buttonTitle: 'Mark as Taken',
                options: {
                    opensAppToForeground: false,
                },
            },
            {
                identifier: ACTION_SKIP,
                buttonTitle: 'Skip',
                options: {
                    opensAppToForeground: false,
                    isDestructive: true,
                },
            },
        ]);

        // Listen for notification responses
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            this.handleNotificationResponse(response);
        });

        // It's good practice to have a way to clean up subscriptions,
        // though in a singleton service, it might live for the app's lifetime.
        // cleanup a la: subscription.remove();
    }

    /**
     * Handles the response when a user interacts with a notification.
     * @param response The notification response.
     */
    private async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
        const { actionIdentifier } = response;
        const { doseLogId } = response.notification.request.content.data as { doseLogId: string };

        if (!doseLogId) {
            logger.warn('Notification response did not contain a doseLogId.');
            return;
        }

        try {
            if (actionIdentifier === ACTION_MARK_AS_TAKEN) {
                await this.doseLogRepository.update(doseLogId, {
                    status: 'taken',
                    actual_time: Date.now(),
                });
                logger.log(`Dose log ${doseLogId} marked as taken.`);
            } else if (actionIdentifier === ACTION_SKIP) {
                await this.doseLogRepository.update(doseLogId, { status: 'skipped' });
                logger.log(`Dose log ${doseLogId} marked as skipped.`);
            } else if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
                // Handle case where user taps the notification body
                // This could navigate to a specific screen, for example
                logger.log(`User opened the app from notification for dose log ${doseLogId}.`);
            }
        } catch (error) {
            logger.error(`Error handling notification response for dose log ${doseLogId}:`, error);
        }
    }
}
