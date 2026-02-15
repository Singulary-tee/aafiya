import { DoseLogRepository } from '../database/repositories/DoseLogRepository';
import { MedicationRepository } from '../database/repositories/MedicationRepository';
import { ScheduleRepository } from '../database/repositories/ScheduleRepository';
import { logger } from './logger';
import { withTransaction } from './transaction';
import { openDatabase } from '../database';

export interface TodayDose {
    scheduleId: string;
    medicationId: string;
    medicationName: string;
    scheduledTime: number;
    status: 'pending' | 'taken' | 'skipped' | 'missed' | 'delayed';
    currentCount: number;
}

/**
 * Takes all pending doses for a profile at the current time.
 * This is a "Take All" quick action that logs multiple doses at once.
 * 
 * @param profileId The profile ID.
 * @param doses Array of doses to take.
 * @returns Object with success count, failed count, and error messages.
 */
export async function takeAllDoses(
    profileId: string,
    doses: TodayDose[]
): Promise<{
    success: number;
    failed: number;
    errors: string[];
}> {
    const db = await openDatabase();
    const doseLogRepo = new DoseLogRepository(db);
    const medicationRepo = new MedicationRepository(db);
    
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const now = Date.now();
    
    // Filter only pending doses
    const pendingDoses = doses.filter(dose => dose.status === 'pending');
    
    if (pendingDoses.length === 0) {
        return { success: 0, failed: 0, errors: ['No pending doses to take'] };
    }
    
    // Process each dose
    for (const dose of pendingDoses) {
        try {
            // Check if medication has sufficient count
            const medication = await medicationRepo.findById(dose.medicationId);
            
            if (!medication) {
                errors.push(`Medication not found: ${dose.medicationName}`);
                failedCount++;
                continue;
            }
            
            if (medication.current_count <= 0) {
                errors.push(`${dose.medicationName}: Out of stock`);
                failedCount++;
                continue;
            }
            
            // Check if medication is paused
            if (medication.paused) {
                errors.push(`${dose.medicationName}: Currently paused`);
                failedCount++;
                continue;
            }
            
            // Use transaction to atomically log dose and decrement count
            const result = await withTransaction(db, async () => {
                // Log the dose
                await doseLogRepo.create({
                    profile_id: profileId,
                    medication_id: dose.medicationId,
                    schedule_id: dose.scheduleId,
                    status: 'taken',
                    scheduled_time: dose.scheduledTime,
                    actual_time: now,
                    notes: 'Taken via Take All',
                });
                
                // Decrement pill count
                await medicationRepo.update(dose.medicationId, {
                    current_count: medication.current_count - 1,
                });
                
                return true;
            });
            
            if (result) {
                successCount++;
                logger.info(`Dose taken: ${dose.medicationName}`);
            } else {
                errors.push(`${dose.medicationName}: Failed to save`);
                failedCount++;
            }
        } catch (error) {
            logger.error(`Error taking dose for ${dose.medicationName}:`, error);
            errors.push(`${dose.medicationName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            failedCount++;
        }
    }
    
    return {
        success: successCount,
        failed: failedCount,
        errors,
    };
}

/**
 * Skips all pending doses for a profile at the current time.
 * 
 * @param profileId The profile ID.
 * @param doses Array of doses to skip.
 * @returns Object with success count, failed count, and error messages.
 */
export async function skipAllDoses(
    profileId: string,
    doses: TodayDose[]
): Promise<{
    success: number;
    failed: number;
    errors: string[];
}> {
    const db = await openDatabase();
    const doseLogRepo = new DoseLogRepository(db);
    
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const now = Date.now();
    
    // Filter only pending doses
    const pendingDoses = doses.filter(dose => dose.status === 'pending');
    
    if (pendingDoses.length === 0) {
        return { success: 0, failed: 0, errors: ['No pending doses to skip'] };
    }
    
    // Process each dose
    for (const dose of pendingDoses) {
        try {
            await doseLogRepo.create({
                profile_id: profileId,
                medication_id: dose.medicationId,
                schedule_id: dose.scheduleId,
                status: 'skipped',
                scheduled_time: dose.scheduledTime,
                actual_time: now,
                notes: 'Skipped via Skip All',
            });
            
            successCount++;
            logger.info(`Dose skipped: ${dose.medicationName}`);
        } catch (error) {
            logger.error(`Error skipping dose for ${dose.medicationName}:`, error);
            errors.push(`${dose.medicationName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            failedCount++;
        }
    }
    
    return {
        success: successCount,
        failed: failedCount,
        errors,
    };
}

/**
 * Gets count of pending doses for a profile that can be taken.
 * Excludes paused medications and out-of-stock medications.
 * 
 * @param profileId The profile ID.
 * @param doses Array of today's doses.
 * @returns Count of doses that can be taken.
 */
export async function getAvailableDosesCount(
    profileId: string,
    doses: TodayDose[]
): Promise<number> {
    const db = await openDatabase();
    const medicationRepo = new MedicationRepository(db);
    
    let count = 0;
    
    for (const dose of doses) {
        if (dose.status !== 'pending') {
            continue;
        }
        
        try {
            const medication = await medicationRepo.findById(dose.medicationId);
            
            if (medication && medication.current_count > 0 && !medication.paused) {
                count++;
            }
        } catch (error) {
            logger.error(`Error checking medication ${dose.medicationId}:`, error);
        }
    }
    
    return count;
}
