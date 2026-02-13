
import { useDatabase } from "./useDatabase";
import { MedicationRepository } from "../database/repositories/MedicationRepository";
import { Medication } from "../database/models/Medication";
import { useState, useEffect, useCallback } from "react";
import { DataSyncService, Repository } from "../services/sync/DataSyncService";
import { ConflictResolver } from "../services/sync/ConflictResolver";
import { getData, storeData } from "../utils/storage";
import { logger } from "../utils/logger";

const LAST_SYNC_KEY = 'last_medication_sync';

export function useMedications(profileId: string | null) {
    const { db, isLoading: isDbLoading } = useDatabase();
    const [medications, setMedications] = useState<Medication[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isDbLoading) {
            return; // Wait for db to be ready
        }

        if (!db || !profileId) {
            setMedications([]);
            setIsLoading(false);
            return;
        }

        const medicationRepo = new MedicationRepository(db);
        let isMounted = true;

        medicationRepo.findByProfileId(profileId).then(meds => {
            if (isMounted) {
                setMedications(meds);
                logger.log(`Loaded ${meds.length} medications for profile ${profileId}.`);
            }
        }).catch(error => {
            logger.error('Failed to load medications:', error);
        }).finally(() => {
            if (isMounted) {
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [db, isDbLoading, profileId]);

    const getRepo = useCallback(() => {
        if (!db) return null;
        return new MedicationRepository(db);
    }, [db]);

    const loadMedications = useCallback(async () => {
        const repo = getRepo();
        if (!repo || !profileId) return;
        const meds = await repo.findByProfileId(profileId);
        setMedications(meds);
    }, [getRepo, profileId]);

    const addMedication = async (medData: Pick<Medication, 'name' | 'strength' | 'initial_count'>) => {
        const repo = getRepo();
        if (!repo || !profileId) return;

        const now = Date.now();
        const newMed: Omit<Medication, 'id'> = {
            ...medData,
            profile_id: profileId,
            current_count: medData.initial_count,
            is_active: 1,
            created_at: now,
            updated_at: now,
        };
        await repo.create(newMed as Medication);
        logger.log(`Added new medication: ${medData.name}`);
        await loadMedications();
    };
    
    const updateMedication = async (medId: string, updates: Partial<Omit<Medication, 'id'>>) => {
        const repo = getRepo();
        if (!repo) return;
        const updatePayload = { ...updates, updated_at: Date.now() };
        await repo.update(medId, updatePayload);
        logger.log(`Updated medication: ${medId}`);
        await loadMedications();
    };

    const syncMedications = useCallback(async () => {
        const repo = getRepo();
        if (!repo) {
            logger.warn('Data sync is not available. Database not ready.');
            return;
        }
        
        const resolver = new ConflictResolver();
        const syncService = new DataSyncService(null as any, repo as unknown as Repository<Medication>, resolver);

        if (!syncService.isApiAvailable()) {
            logger.warn('Data sync is not available. A remote API endpoint is required.');
            return;
        }

        try {
            setIsLoading(true);
            const lastSyncTimestamp = await getData(LAST_SYNC_KEY) ?? 0;
            const newSyncTimestamp = await syncService.syncDown(lastSyncTimestamp as number);
            await storeData(LAST_SYNC_KEY, newSyncTimestamp);
            logger.log('Medication sync completed successfully.');
            await loadMedications();
        } catch (error) {
            logger.error('Medication sync failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getRepo, loadMedications]);

    return { medications, isLoading, addMedication, updateMedication, syncMedications };
}
