import { useDatabase } from "./useDatabase";
import { NotificationScheduler } from "../services/notification/NotificationScheduler";
import { Medication } from "../database/models/Medication";
import { Schedule } from "../database/models/Schedule";
import { useCallback } from "react";
import { DoseLogRepository } from "../database/repositories/DoseLogRepository";

/**
 * useNotifications
 * A hook for managing notifications.
 */
export function useNotifications() {
    const db = useDatabase();

    const scheduleNotifications = useCallback(async (medication: Medication, schedule: Schedule) => {
        if (db) {
            const doseLogRepository = new DoseLogRepository(db);
            const scheduler = new NotificationScheduler(doseLogRepository);
            await scheduler.scheduleNotifications(medication, schedule);
        }
    }, [db]);

    const cancelNotifications = useCallback(async (medicationId: string) => {
        if (db) {
            const doseLogRepository = new DoseLogRepository(db);
            const scheduler = new NotificationScheduler(doseLogRepository);
            await scheduler.cancelNotifications(medicationId);
        }
    }, [db]);

    return { scheduleNotifications, cancelNotifications };
}
