import { useDatabase } from "./useDatabase";
import { MedicationRepository } from "../database/repositories/MedicationRepository";
import { Medication } from "../database/models/Medication";
import { useState, useEffect, useCallback } from "react";
import { DataSyncService, SyncAPI, Repository } from "../services/sync/DataSyncService";
import { ConflictResolver } from "../services/sync/ConflictResolver";
import { getData, storeData } from "../utils/storage";
import { logger } from "../utils/logger";

const LAST_SYNC_KEY = 'last_medication_sync';

// NOTE: The SyncAPI is not implemented. A real implementation would be needed to sync with a remote server.
// For now, the syncMedications function will log a warning.

/**
 * useMedications
 * A hook for managing and synchronizing medications locally.
 * It is structured to support remote data synchronization when a SyncAPI is provided.
 */
export function useMedications(profileId: string) {
    const db = useDatabase();
    const [medications, setMedications] = useState<Medication[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [medicationRepo, setMedicationRepo] = useState<MedicationRepository | null>(null);
    const [syncService, setSyncService] = useState<DataSyncService<Medication> | null>(null);

    useEffect(() => {
        if (db) {
            const repo = new MedicationRepository(db);
            const resolver = new ConflictResolver();

            // A real SyncAPI implementation would be injected here.
            const service = new DataSyncService(null as any, repo as unknown as Repository<Medication>, resolver);
            
            setMedicationRepo(repo);
            setSyncService(service);
        }
    }, [db]);

    const loadMedications = useCallback(async () => {
        if (!medicationRepo || !profileId) return;
        try {
            setIsLoading(true);
            const meds = await medicationRepo.findByProfileId(profileId);
            setMedications(meds);
            logger.log(`Loaded ${meds.length} medications from local database for profile ${profileId}.`);
        } catch (error) {
            logger.error('Failed to load medications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [medicationRepo, profileId]);

    useEffect(() => {
        loadMedications();
    }, [loadMedications]);

    /**
     * Initiates the synchronization process. Requires a real SyncAPI implementation.
     */
    const syncMedications = useCallback(async () => {
        if (!syncService || !syncService.isApiAvailable()) {
            logger.warn('Data sync is not available. A remote API endpoint is required.');
            return;
        }
        try {
            setIsLoading(true);
            const lastSyncTimestamp = await getData(LAST_SYNC_KEY) ?? 0;
            const newSyncTimestamp = await syncService.syncDown(lastSyncTimestamp as number);
            await storeData(LAST_SYNC_KEY, newSyncTimestamp);
            logger.log('Medication sync completed successfully.');
            await loadMedications(); // Reload data after sync
        } catch (error) {
            logger.error('Medication sync failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [syncService, loadMedications]);

    const addMedication = async (medData: Pick<Medication, 'name' | 'strength' | 'initial_count'>) => {
        if (!medicationRepo || !profileId) return;
        const now = Date.now();
        const newMed: Omit<Medication, 'id'> = {
            ...medData,
            profile_id: profileId,
            current_count: medData.initial_count,
            is_active: 1,
            created_at: now,
            updated_at: now,
        };
        await medicationRepo.create(newMed as Medication);
        logger.log(`Added new medication: ${medData.name}`);
        await loadMedications(); // Refresh list
    };

    const updateMedication = async (medId: string, updates: Partial<Omit<Medication, 'id'>>) => {
        if (!medicationRepo) return;
        const updatePayload = { ...updates, updated_at: Date.now() };
        await medicationRepo.update(medId, updatePayload);
        logger.log(`Updated medication: ${medId}`);
        await loadMedications(); // Refresh list
    };

    return { medications, isLoading, addMedication, updateMedication, syncMedications };
}
