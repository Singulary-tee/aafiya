/**
 * Represents the calculated health metrics for a profile.
 */
export interface HealthMetrics {
    profile_id: string;
    health_score: number;
    last_calculated: number;
}
