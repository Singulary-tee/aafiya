
import { MedicationRepository } from '../../database/repositories/MedicationRepository';
import { ScheduleRepository } from '../../database/repositories/ScheduleRepository';
import { STORAGE_LEVELS } from '../../constants/config';
import { logger } from '../../utils/logger';

export type StorageStatus = 'GOOD' | 'LOW' | 'URGENT';

export interface StorageInfo {
    daysRemaining: number;
    status: StorageStatus;
}

/**
 * Service for calculating medication storage levels.
 */
export class StorageCalculatorService {
    private medicationRepository: MedicationRepository;
    private scheduleRepository: ScheduleRepository;

    constructor(
        medicationRepository: MedicationRepository,
        scheduleRepository: ScheduleRepository
    ) {
        this.medicationRepository = medicationRepository;
        this.scheduleRepository = scheduleRepository;
    }

    /**
     * Calculates the remaining days of medication and the corresponding status.
     * @param medicationId The ID of the medication to check.
     * @returns An object containing the days remaining and the storage status, or null if calculation is not possible.
     */
    async getStorageInfo(medicationId: string): Promise<StorageInfo | null> {
        const medication = await this.medicationRepository.findById(medicationId);
        if (!medication || medication.current_count === null) {
            logger.warn(`[StorageCalculator] Medication or current count not available for ID: ${medicationId}.`);
            return null;
        }

        const schedules = await this.scheduleRepository.findByMedicationId(medicationId);
        if (schedules.length === 0) {
            logger.log(`[StorageCalculator] No active schedules for medication ID: ${medicationId}. Cannot calculate daily dosage.`);
            return null;
        }

        let dosesPerDay = 0;
        for (const schedule of schedules) {
            if (schedule.days_of_week && schedule.days_of_week.length > 0) {
                // This logic assumes a weekly schedule. For daily, this would be times.length.
                dosesPerDay += (schedule.times.length * schedule.days_of_week.length) / 7.0;
            } else {
                // Assumes a daily schedule if days_of_week is not specified
                dosesPerDay += schedule.times.length;
            }
        }

        if (dosesPerDay <= 0) {
            logger.log(`[StorageCalculator] Daily dosage is zero or less for medication ID: ${medicationId}.`);
            return { daysRemaining: Infinity, status: 'GOOD' };
        }

        const daysRemaining = Math.floor(medication.current_count / dosesPerDay);
        logger.log(`[StorageCalculator] Medication ID ${medicationId}: Current count=${medication.current_count}, Doses/day=${dosesPerDay.toFixed(2)}, Days remaining=${daysRemaining}`);
        
        let status: StorageStatus = 'URGENT';
        if (daysRemaining >= STORAGE_LEVELS.GOOD) {
            status = 'GOOD';
        } else if (daysRemaining >= STORAGE_LEVELS.LOW) {
            status = 'LOW';
        }

        return { daysRemaining, status };
    }
}
