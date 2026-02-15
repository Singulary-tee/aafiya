import { SQLiteDatabase } from 'expo-sqlite';
import { HealthMetricsRepository } from '../database/repositories/HealthMetricsRepository';
import { DoseLogRepository } from '../database/repositories/DoseLogRepository';
import { logger } from './logger';

/**
 * Health score calculation utility.
 * Implements:
 * - Recalculation on every dose event
 * - Clamping to 0-100 range
 * - Caching in health_metrics table
 * - Recalculation from dose_log on app start
 */

interface HealthScoreParams {
  takenCount: number;
  missedCount: number;
  skippedCount: number;
  delayedCount?: number; // New: count of delayed doses
  totalScheduled: number;
}

/**
 * Calculates health score based on medication adherence.
 * Score is based on:
 * - Taken doses: +1 point each
 * - Delayed doses: +0.8 points each (lighter penalty than missed)
 * - Skipped doses: -0.5 points each
 * - Missed doses: -1 point each
 * Result is clamped to 0-100 range.
 */
export function calculateHealthScore(params: HealthScoreParams): number {
  const { takenCount, missedCount, skippedCount, delayedCount = 0, totalScheduled } = params;
  
  if (totalScheduled === 0) {
    return 100; // No doses scheduled means perfect health score
  }
  
  // Calculate raw score
  // Delayed doses get 0.8 points (lighter penalty than skipped/missed)
  const points = takenCount + (delayedCount * 0.8) - missedCount - (skippedCount * 0.5);
  const maxPoints = totalScheduled;
  
  // Convert to percentage
  let score = (points / maxPoints) * 100;
  
  // Clamp to 0-100 range
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
}

/**
 * Recalculates health score from dose log for a profile.
 * Uses last 30 days of data.
 */
export async function recalculateHealthScore(
  db: SQLiteDatabase,
  profileId: string
): Promise<number> {
  try {
    const doseLogRepo = new DoseLogRepository(db);
    const metricsRepo = new HealthMetricsRepository(db);
    
    // Get doses from last 30 days
    const endTime = Date.now();
    const startTime = endTime - (30 * 24 * 60 * 60 * 1000);
    
    const doses = await doseLogRepo.findByProfileIdAndDateRange(
      profileId,
      startTime,
      endTime
    );
    
    // Count by status
    const takenCount = doses.filter(d => d.status === 'taken').length;
    const missedCount = doses.filter(d => d.status === 'missed').length;
    const skippedCount = doses.filter(d => d.status === 'skipped').length;
    const delayedCount = doses.filter(d => d.status === 'delayed').length;
    const totalScheduled = doses.length;
    
    // Calculate score
    const score = calculateHealthScore({
      takenCount,
      missedCount,
      skippedCount,
      delayedCount,
      totalScheduled
    });
    
    // Save to database
    const now = Date.now();
    const existing = await metricsRepo.findByProfileId(profileId);
    
    if (existing) {
      await metricsRepo.update(profileId, {
        health_score: score,
        last_calculated: now
      });
    } else {
      await metricsRepo.create({
        profile_id: profileId,
        health_score: score,
        last_calculated: now
      });
    }
    
    logger.info(`Health score recalculated for profile ${profileId}: ${score}`);
    return score;
  } catch (error) {
    logger.error('Failed to recalculate health score:', error);
    throw error;
  }
}

/**
 * Updates health score after a dose event.
 * This should be called whenever a dose is logged.
 */
export async function updateHealthScoreOnDoseEvent(
  db: SQLiteDatabase,
  profileId: string
): Promise<number> {
  return recalculateHealthScore(db, profileId);
}

/**
 * Gets current health score or recalculates if stale.
 * Score is considered stale if older than 1 hour.
 */
export async function getCurrentHealthScore(
  db: SQLiteDatabase,
  profileId: string
): Promise<number> {
  try {
    const metricsRepo = new HealthMetricsRepository(db);
    const existing = await metricsRepo.findByProfileId(profileId);
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const isStale = !existing || existing.last_calculated < oneHourAgo;
    
    if (isStale) {
      // Recalculate if stale or doesn't exist
      return await recalculateHealthScore(db, profileId);
    }
    
    return existing.health_score;
  } catch (error) {
    logger.error('Failed to get current health score:', error);
    return 100; // Default to perfect score on error
  }
}

/**
 * Determines health status based on score.
 */
export function getHealthStatus(score: number): 'healthy' | 'attention' | 'risk' | 'critical' {
  if (score >= 80) return 'healthy';
  if (score >= 60) return 'attention';
  if (score >= 40) return 'risk';
  return 'critical';
}
