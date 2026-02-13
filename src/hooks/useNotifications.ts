import { useDatabase } from "./useDatabase";
import { NotificationScheduler } from "../services/notification/NotificationScheduler";
import { Medication } from "../database/models/Medication";
import { Schedule } from "../database/models/Schedule";
import { useCallback } from "react";
import { DoseLogRepository } from "../database/repositories/DoseLogRepository";
import { ProfileRepository } from "../database/repositories/ProfileRepository";
import { MedicationRepository } from "../database/repositories/MedicationRepository";
import { ScheduleRepository } from "../database/repositories/ScheduleRepository";

/**
 * useNotifications
 * A hook for managing notifications.
 */
export function useNotifications() {
    const db = useDatabase();

    const schedule = useCallback(async (medication: Medication, schedules: Schedule[], profileId: string) => {
        if (db) {
            const doseLogRepository = new DoseLogRepository(db);
            const profileRepository = new ProfileRepository(db);
            const medicationRepository = new MedicationRepository(db);
            const scheduleRepository = new ScheduleRepository(db);
            const scheduler = new NotificationScheduler(doseLogRepository, profileRepository, medicationRepository, scheduleRepository);
            await scheduler.schedule(medication, schedules, profileId);
        }
    }, [db]);

    const cancel = useCallback(async (medicationId: string) => {
        if (db) {
            const doseLogRepository = new DoseLogRepository(db);
            const profileRepository = new ProfileRepository(db);
            const medicationRepository = new MedicationRepository(db);
            const scheduleRepository = new ScheduleRepository(db);
            const scheduler = new NotificationScheduler(doseLogRepository, profileRepository, medicationRepository, scheduleRepository);
            await scheduler.cancel(medicationId);
        }
    }, [db]);

    return { schedule, cancel };
}
