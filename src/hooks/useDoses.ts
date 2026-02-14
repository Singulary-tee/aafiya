import { useDatabase } from "./useDatabase";
import { DoseLogRepository, DoseLogData } from "../database/repositories/DoseLogRepository";
import { DoseLog } from "../database/models/DoseLog";
import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * useDoses
 * A hook for managing doses.
 */
export function useDoses(medicationId: string) {
    const { db, isLoading } = useDatabase();
    const [doses, setDoses] = useState<DoseLog[]>([]);

    const doseLogRepository = useMemo(() => {
        if (db) {
            return new DoseLogRepository(db);
        }
    }, [db]);

    const loadDoses = useCallback(async () => {
        if (doseLogRepository) {
            const doseLogs = await doseLogRepository.findByMedicationId(medicationId);
            setDoses(doseLogs);
        }
    }, [doseLogRepository, medicationId]);

    useEffect(() => {
        if (!isLoading) {
            loadDoses();
        }
    }, [isLoading, loadDoses]);

    const logDose = async (dose: DoseLogData) => {
        if (doseLogRepository) {
            await doseLogRepository.create(dose);
            loadDoses();
        }
    };

    return { doses, logDose };
}
