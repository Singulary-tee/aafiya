import { useDatabase } from "./useDatabase";
import { NotificationScheduler } from "../services/notification/NotificationScheduler";
import { Medication } from "../database/models/Medication";
import { Schedule } from "../database/models/Schedule";
import { useCallback, useMemo } from "react";
import { DoseLogRepository } from "../database/repositories/DoseLogRepository";
import { ProfileRepository } from "../database/repositories/ProfileRepository";
import { MedicationRepository } from "../database/repositories/MedicationRepository";
import { ScheduleRepository } from "../database/repositories/ScheduleRepository";

/**
 * useNotifications
 * A hook for managing notifications.
 */
export function useNotifications() {
    const { db, isLoading } = useDatabase();

    const doseLogRepository = useMemo(() => db ? new DoseLogRepository(db) : null, [db]);
    const profileRepository = useMemo(() => db ? new ProfileRepository(db) : null, [db]);
    const medicationRepository = useMemo(() => db ? new MedicationRepository(db) : null, [db]);
    const scheduleRepository = useMemo(() => db ? new ScheduleRepository(db) : null, [db]);

    const schedule = useCallback(async (medication: Medication, schedules: Schedule[], profileId: string) => {
        if (!isLoading && doseLogRepository && profileRepository && medicationRepository && scheduleRepository) {
            const scheduler = new NotificationScheduler(doseLogRepository, profileRepository, medicationRepository, scheduleRepository);
            await scheduler.schedule(medication, schedules, profileId);
        }
    }, [isLoading, doseLogRepository, profileRepository, medicationRepository, scheduleRepository]);

    const cancel = useCallback(async (medicationId: string) => {
        if (!isLoading && doseLogRepository && profileRepository && medicationRepository && scheduleRepository) {
            const scheduler = new NotificationScheduler(doseLogRepository, profileRepository, medicationRepository, scheduleRepository);
            await scheduler.cancel(medicationId);
        }
    }, [isLoading, doseLogRepository, profileRepository, medicationRepository, scheduleRepository]);

    return { schedule, cancel };
}
