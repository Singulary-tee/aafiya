/**
 * Schedule Model
 * Represents a dosing schedule for medications
 */

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Schedule {
  id: string; // UUID v4
  medication_id: string; // Foreign key to Medication
  time: string; // HH:mm format (e.g., "08:00")
  days: string; // JSON array of DayOfWeek or "daily"
  grace_period_minutes: number; // Default 30, configurable 0-120
  is_active: number; // Boolean: 1=active, 0=disabled
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface ScheduleInput {
  time: string;
  days?: DayOfWeek[] | 'daily';
  grace_period_minutes?: number;
}

export interface ScheduleUpdate {
  time?: string;
  days?: DayOfWeek[] | 'daily';
  grace_period_minutes?: number;
  is_active?: number;
}

export enum DoseStatus {
  PENDING = 'pending',
  TAKEN = 'taken',
  MISSED = 'missed',
  SKIPPED = 'skipped',
  LATE = 'late',
}
