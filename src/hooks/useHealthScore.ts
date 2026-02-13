import { useDatabase } from './useDatabase';
import { HealthScoreCalculatorService } from '../services/health/HealthScoreCalculator';
import { DoseLogRepository } from '../database/repositories/DoseLogRepository';
import { HealthMetricsRepository } from '../database/repositories/HealthMetricsRepository';
import { useState, useEffect, useCallback } from 'react';

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
            const healthMetricsRepository = new HealthMetricsRepository(db);
            const calculator = new HealthScoreCalculatorService(doseLogRepository, healthMetricsRepository);
            const metrics = await calculator.calculateAndSave(profileId);
            setHealthScore(metrics.health_score);
        }
    }, [db, profileId]);

    useEffect(() => {
        calculateHealthScore();
    }, [calculateHealthScore]);

    return { healthScore, refreshHealthScore: calculateHealthScore };
}
