/**
 * Schedule Model
 * Represents a dosing schedule for medications
 */

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday to Saturday

export interface Schedule {
  id: string; // UUID v4
  medication_id: string; // Foreign key to Medication
  times: string; // JSON array of time strings (HH:mm)
  days_of_week: string; // JSON array of DayOfWeek or null for daily
  grace_period_minutes: number; // Default 30, configurable 0-120
  is_active: number; // Boolean: 1=active, 0=disabled
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface ScheduleInput {
  times: string[];
  days_of_week?: DayOfWeek[] | null;
  grace_period_minutes?: number;
}

export interface ScheduleUpdate {
  times?: string[];
  days_of_week?: DayOfWeek[] | null;
  grace_period_minutes?: number;
  is_active?: number;
}
