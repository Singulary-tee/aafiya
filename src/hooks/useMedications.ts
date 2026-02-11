import { useDatabase } from "./useDatabase";
import { MedicationRepository } from "../database/repositories/MedicationRepository";
import { Medication } from "../database/models/Medication";
import { useState, useEffect, useCallback } from "react";

/**
 * useMedications
 * A hook for managing medications.
 */
export function useMedications(profileId: string) {
    const db = useDatabase();
    const [medications, setMedications] = useState<Medication[]>([]);

    const medicationRepository = db ? new MedicationRepository(db) : null;

    const loadMedications = useCallback(async () => {
        if (medicationRepository) {
            const meds = await medicationRepository.getForProfile(profileId);
            setMedications(meds);
        }
    }, [medicationRepository, profileId]);

    useEffect(() => {
        loadMedications();
    }, [loadMedications]);

    const addMedication = async (medication: Omit<Medication, 'id'>) => {
        if (medicationRepository) {
            await medicationRepository.create(medication as Medication);
            loadMedications();
        }
    };

    return { medications, addMedication };
}
