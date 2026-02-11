import { useDatabase } from "./useDatabase";
import { HealthScoreCalculator } from "../services/health/HealthScoreCalculator";
import { DoseLogRepository } from "../database/repositories/DoseLogRepository";
import { ProfileRepository } from "../database/repositories/ProfileRepository";
import { useState, useEffect, useCallback } from "react";

/**
 * useHealthScore
 * A hook for calculating and providing the health score.
 */
export function useHealthScore(profileId: string) {
    const db = useDatabase();
    const [healthScore, setHealthScore] = useState<number>(100);

    const calculateHealthScore = useCallback(async () => {
        if (db) {
            const doseLogRepository = new DoseLogRepository(db);
            const profileRepository = new ProfileRepository(db);
            const calculator = new HealthScoreCalculator(doseLogRepository, profileRepository);
            const score = await calculator.calculate(profileId);
            setHealthScore(score);
        }
    }, [db, profileId]);

    useEffect(() => {
        calculateHealthScore();
    }, [calculateHealthScore]);

    return { healthScore, refreshHealthScore: calculateHealthScore };
}
