/**
 * HealthMetrics Model
 * Stores calculated health scores
 */

export interface HealthMetrics {
  profile_id: string; // Foreign key to Profile
  health_score: number; // 0-100 percentage
  last_calculated: number; // Unix timestamp when calculated
}

export interface HealthMetricsInput {
  profile_id: string;
  health_score: number;
}
