
import { useDatabase } from './useDatabase';
import { HealthScoreCalculatorService } from '../services/health/HealthScoreCalculator';
import { DoseLogRepository } from '../database/repositories/DoseLogRepository';
import { HealthMetricsRepository } from '../database/repositories/HealthMetricsRepository';
import { useState, useEffect, useCallback } from 'react';

/**
 * useHealthScore
 * A hook for calculating and providing the health score.
 */
export function useHealthScore(profileId: string | null) {
    const { db, isLoading: isDbLoading } = useDatabase();
    const [healthScore, setHealthScore] = useState<number>(100);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const calculateHealthScore = useCallback(async () => {
        if (isDbLoading || !db || !profileId) {
            return; // Wait for db and profileId
        }
        
        setIsLoading(true);
        try {
            const doseLogRepository = new DoseLogRepository(db);
            const healthMetricsRepository = new HealthMetricsRepository(db);
            const calculator = new HealthScoreCalculatorService(doseLogRepository, healthMetricsRepository);
            const metrics = await calculator.calculateAndSave(profileId);
            setHealthScore(metrics.health_score);
        } catch (error) {
            console.error("Failed to calculate health score:", error);
            // Optionally reset to a default or show an error state
            setHealthScore(100); 
        } finally {
            setIsLoading(false);
        }
    }, [db, isDbLoading, profileId]);

    useEffect(() => {
        calculateHealthScore();
    }, [calculateHealthScore]);

    return { healthScore, isLoading, refreshHealthScore: calculateHealthScore };
}
