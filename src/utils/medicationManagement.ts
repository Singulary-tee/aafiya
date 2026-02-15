import { Medication } from '../database/models/Medication';
import { MedicationRepository } from '../database/repositories/MedicationRepository';
import { logger } from './logger';

/**
 * Checks if a medication's therapy is complete based on therapy duration and start date.
 * @param medication The medication to check.
 * @returns true if therapy is complete, false otherwise.
 */
export function isTherapyComplete(medication: Medication): boolean {
    if (medication.therapy_type !== 'limited' || !medication.therapy_duration || !medication.therapy_start_date) {
        return false;
    }

    const now = Date.now();
    const therapyEndDate = medication.therapy_start_date + (medication.therapy_duration * 24 * 60 * 60 * 1000);
    
    return now >= therapyEndDate;
}

/**
 * Calculates the number of days remaining in a limited therapy.
 * @param medication The medication to check.
 * @returns Number of days remaining, or null if not a limited therapy or therapy is complete.
 */
export function getDaysRemainingInTherapy(medication: Medication): number | null {
    if (medication.therapy_type !== 'limited' || !medication.therapy_duration || !medication.therapy_start_date) {
        return null;
    }

    const now = Date.now();
    const therapyEndDate = medication.therapy_start_date + (medication.therapy_duration * 24 * 60 * 60 * 1000);
    const msRemaining = therapyEndDate - now;
    
    if (msRemaining <= 0) {
        return 0;
    }
    
    return Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
}

/**
 * Archives a medication (soft delete).
 * @param medicationRepo The medication repository.
 * @param medicationId The ID of the medication to archive.
 * @returns The updated medication object.
 */
export async function archiveMedication(
    medicationRepo: MedicationRepository,
    medicationId: string
): Promise<Medication> {
    const now = Date.now();
    
    try {
        const updated = await medicationRepo.update(medicationId, {
            archived: 1,
            archived_at: now,
            is_active: 0, // Also mark as inactive
        });
        
        logger.info(`Medication archived: ${medicationId}`);
        return updated;
    } catch (error) {
        logger.error('Error archiving medication:', error);
        throw error;
    }
}

/**
 * Unarchives a medication.
 * @param medicationRepo The medication repository.
 * @param medicationId The ID of the medication to unarchive.
 * @returns The updated medication object.
 */
export async function unarchiveMedication(
    medicationRepo: MedicationRepository,
    medicationId: string
): Promise<Medication> {
    try {
        const updated = await medicationRepo.update(medicationId, {
            archived: 0,
            archived_at: null,
            is_active: 1, // Re-activate
        });
        
        logger.info(`Medication unarchived: ${medicationId}`);
        return updated;
    } catch (error) {
        logger.error('Error unarchiving medication:', error);
        throw error;
    }
}

/**
 * Pauses a medication temporarily.
 * @param medicationRepo The medication repository.
 * @param medicationId The ID of the medication to pause.
 * @param reason Optional reason for pausing.
 * @returns The updated medication object.
 */
export async function pauseMedication(
    medicationRepo: MedicationRepository,
    medicationId: string,
    reason?: string
): Promise<Medication> {
    const now = Date.now();
    
    try {
        const updated = await medicationRepo.update(medicationId, {
            paused: 1,
            paused_at: now,
            pause_reason: reason || null,
        });
        
        logger.info(`Medication paused: ${medicationId}`);
        return updated;
    } catch (error) {
        logger.error('Error pausing medication:', error);
        throw error;
    }
}

/**
 * Resumes a paused medication.
 * @param medicationRepo The medication repository.
 * @param medicationId The ID of the medication to resume.
 * @returns The updated medication object.
 */
export async function resumeMedication(
    medicationRepo: MedicationRepository,
    medicationId: string
): Promise<Medication> {
    try {
        const updated = await medicationRepo.update(medicationId, {
            paused: 0,
            paused_at: null,
            pause_reason: null,
        });
        
        logger.info(`Medication resumed: ${medicationId}`);
        return updated;
    } catch (error) {
        logger.error('Error resuming medication:', error);
        throw error;
    }
}

/**
 * Auto-archives completed limited therapies.
 * Should be called periodically (e.g., daily check).
 * @param medicationRepo The medication repository.
 * @param profileId The profile ID to check medications for.
 * @returns Array of archived medication IDs.
 */
export async function autoArchiveCompletedTherapies(
    medicationRepo: MedicationRepository,
    profileId: string
): Promise<string[]> {
    try {
        const medications = await medicationRepo.findByProfileId(profileId);
        const archivedIds: string[] = [];
        
        for (const medication of medications) {
            // Skip already archived or inactive medications
            if (medication.archived || !medication.is_active) {
                continue;
            }
            
            // Check if therapy is complete
            if (isTherapyComplete(medication)) {
                await archiveMedication(medicationRepo, medication.id);
                archivedIds.push(medication.id);
            }
        }
        
        if (archivedIds.length > 0) {
            logger.info(`Auto-archived ${archivedIds.length} completed therapies for profile ${profileId}`);
        }
        
        return archivedIds;
    } catch (error) {
        logger.error('Error auto-archiving completed therapies:', error);
        return [];
    }
}

/**
 * Checks if a medication with the same name already exists for a profile.
 * @param medicationRepo The medication repository.
 * @param profileId The profile ID.
 * @param medicationName The medication name to check.
 * @param excludeId Optional medication ID to exclude from check (for updates).
 * @returns The existing medication if found, or null.
 */
export async function findDuplicateMedication(
    medicationRepo: MedicationRepository,
    profileId: string,
    medicationName: string,
    excludeId?: string
): Promise<Medication | null> {
    try {
        const medications = await medicationRepo.findByProfileId(profileId);
        const normalizedName = medicationName.trim().toLowerCase();
        
        for (const med of medications) {
            // Skip the medication being updated
            if (excludeId && med.id === excludeId) {
                continue;
            }
            
            // Skip archived medications
            if (med.archived) {
                continue;
            }
            
            // Compare normalized names
            if (med.name.trim().toLowerCase() === normalizedName) {
                return med;
            }
            
            // Also check generic name if available
            if (med.generic_name && med.generic_name.trim().toLowerCase() === normalizedName) {
                return med;
            }
        }
        
        return null;
    } catch (error) {
        logger.error('Error checking for duplicate medication:', error);
        return null;
    }
}
