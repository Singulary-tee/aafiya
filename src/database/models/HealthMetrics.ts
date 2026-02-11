/**
 * HealthMetrics Model
 * Stores calculated health scores and metrics
 */

export interface HealthMetrics {
  id: string; // UUID v4
  profile_id: string; // Foreign key to Profile
  medication_id?: string; // Optional, for per-medication metrics
  health_score: number; // 0-100 percentage
  streak_days: number; // Consecutive days of adherence
  last_dose_time?: number; // Unix timestamp of last dose taken
  adherence_percentage: number; // 0-100 percentage
  missed_doses_count: number; // Total missed doses
  late_doses_count: number; // Total late doses
  skipped_doses_count: number; // Total skipped doses
  total_doses_expected: number; // Total doses scheduled in period
  calculated_at: number; // Unix timestamp when calculated
  period_start: number; // Unix timestamp of calculation period start
  period_end: number; // Unix timestamp of calculation period end
}

export interface HealthMetricsInput {
  profile_id: string;
  medication_id?: string;
  health_score: number;
  streak_days: number;
  adhereance_percentage: number;
  missed_doses_count: number;
}

export interface HealthMetricsSnapshot {
  health_score: number;
  streak_days: number;
  adherence_percentage: number;
  missed_doses_count: number;
  late_doses_count: number;
  skipped_doses_count: number;
}
