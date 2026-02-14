
import { useCallback, useEffect, useState } from "react";
import { Medication } from "../database/models/Medication";
import { Schedule } from "../database/models/Schedule";
import { MedicationRepository } from "../database/repositories/MedicationRepository";
import { ScheduleRepository } from "../database/repositories/ScheduleRepository";
import { ConflictResolver } from "../services/sync/ConflictResolver";
import { DataSyncService, Repository } from "../services/sync/DataSyncService";
import { RxNormProperty } from "../types/api";
import { logger } from "../utils/logger";
import { getData, storeData } from "../utils/storage";
import { useDatabase } from "./useDatabase";

// API Imports
import { ApiCacheRepository } from '../database/repositories/ApiCacheRepository';
import { DailyMedService } from '../services/api/DailyMedService';
import { RxNormService } from '../services/api/RxNormService';

const LAST_SYNC_KEY = 'last_medication_sync';

type MedicationSeed = {
    name: string;
    rxcui?: string | null;
    synonym?: string | null;
};

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

    const getApiServices = useCallback(() => {
        if (!db) return null;
        const apiCacheRepo = new ApiCacheRepository(db);
        return {
            rxNormService: new RxNormService(apiCacheRepo),
            dailyMedService: new DailyMedService(apiCacheRepo),
        };
    }, [db]);

    const loadMedications = useCallback(async () => {
        const repo = getRepo();
        if (!repo || !profileId) return;
        const meds = await repo.findByProfileId(profileId);
        setMedications(meds);
    }, [getRepo, profileId]);

    const addMedication = async (
        selectedDrug: MedicationSeed,
        formData: { strength: string; initialCount: string; scheduleTimes: string[]; gracePeriodMinutes?: number; notificationSound?: string | null; }
    ): Promise<{ medication: Medication; schedules: Schedule[] } | null> => {
        const repo = getRepo();
        const services = getApiServices();
        if (!repo || !profileId || !services || !db) return null;

        if (!formData.scheduleTimes.length) {
            logger.warn('Cannot add medication without schedule times.');
            return null;
        }

        const initialCountValue = Number.parseInt(formData.initialCount, 10);
        if (Number.isNaN(initialCountValue)) {
            logger.warn('Invalid initial count provided for medication.');
            return null;
        }

        const now = Date.now();
        let newMed: Omit<Medication, 'id'> = {
            profile_id: profileId,
            name: selectedDrug.name,
            strength: formData.strength,
            initial_count: initialCountValue,
            current_count: initialCountValue,
            is_active: 1,
            created_at: now,
            updated_at: now,
            rxcui: selectedDrug.rxcui ?? null,
            generic_name: selectedDrug.name,
            brand_name: null,
            dosage_form: null,
            image_url: null,
            notes: null,
        };

        if (selectedDrug.rxcui) {
            try {
                logger.log(`Enriching medication data for RXCUI: ${selectedDrug.rxcui}`);
                const properties = await services.rxNormService.getProperties(selectedDrug.rxcui);
                if (properties.propertiesGroup?.propConcept) {
                    const brandNameProp = properties.propertiesGroup.propConcept.find((p: RxNormProperty) => p.propName === 'BRAND_NAME');
                    if (brandNameProp) newMed.brand_name = brandNameProp.propValue;
                    
                    const dosageFormProp = properties.propertiesGroup.propConcept.find((p: RxNormProperty) => p.propName === 'DOSAGE_FORM');
                    if (dosageFormProp) newMed.dosage_form = dosageFormProp.propValue;
                }

                const drugNameToSearchImage = newMed.brand_name || newMed.name;
                const spls = await services.dailyMedService.getSpls(drugNameToSearchImage);
                if (spls && spls.data.length > 0) {
                    for (const spl of spls.data) {
                        const media = await services.dailyMedService.getMedia(spl.setid);
                        if (media && media.data.length > 0) {
                            const image = media.data.find(m => m.mimetype.startsWith('image/'));
                            if (image) {
                                newMed.image_url = image.url;
                                break; 
                            }
                        }
                    }
                }
                logger.log('Enrichment complete.');
            } catch (error) {
                logger.error('Failed to enrich medication data. Saving basic info anyway.', error);
            }
        } else {
            logger.log('Manual medication entry detected. Skipping API enrichment.');
        }

        const createdMed = await repo.create(newMed as Medication);
        logger.log(`Added new medication: ${newMed.name}`);

        const scheduleRepo = new ScheduleRepository(db);
        const newSchedule: Omit<Schedule, 'id'> = {
            medication_id: createdMed.id,
            times: formData.scheduleTimes,
            days_of_week: null, 
            is_active: 1,
            grace_period_minutes: formData.gracePeriodMinutes ?? 30,
            notification_sound: formData.notificationSound ?? null,
            created_at: now,
            updated_at: now,
        };
        const createdSchedule = await scheduleRepo.create(newSchedule as Schedule);

        await loadMedications();
        return { medication: createdMed, schedules: [createdSchedule] };
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
