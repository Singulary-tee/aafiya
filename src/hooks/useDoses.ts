import { useDatabase } from "./useDatabase";
import { DoseLogRepository } from "../database/repositories/DoseLogRepository";
import { DoseLog } from "../database/models/DoseLog";
import { useState, useEffect, useCallback } from "react";

/**
 * useDoses
 * A hook for managing doses.
 */
export function useDoses(medicationId: string) {
    const db = useDatabase();
    const [doses, setDoses] = useState<DoseLog[]>([]);

    const doseLogRepository = db ? new DoseLogRepository(db) : null;

    const loadDoses = useCallback(async () => {
        if (doseLogRepository) {
            const doseLogs = await doseLogRepository.findByMedicationId(medicationId);
            setDoses(doseLogs);
        }
    }, [doseLogRepository, medicationId]);

    useEffect(() => {
        loadDoses();
    }, [loadDoses]);

    const logDose = async (dose: Omit<DoseLog, 'id'>) => {
        if (doseLogRepository) {
            await doseLogRepository.create(dose as DoseLog);
            loadDoses();
        }
    };

    return { doses, logDose };
}
