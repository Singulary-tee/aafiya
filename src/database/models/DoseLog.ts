/**
 * DoseLog Model
 * Records dose-taking history for tracking and statistics
 */

export type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped' | 'late';

export interface DoseLog {
  id: string; // UUID v4
  medication_id: string; // Foreign key to Medication
  schedule_id: string; // Foreign key to Schedule
  scheduled_time: number; // Unix timestamp of scheduled time
  actual_time?: number; // Unix timestamp when actually taken (if taken)
  status: DoseStatus; // pending, taken, missed, skipped, late
  notes?: string; // Optional user notes
  created_at: number; // Unix timestamp
}

export interface DoseLogInput {
  medication_id: string;
  schedule_id: string;
  scheduled_time: number;
  status: DoseStatus;
  actual_time?: number;
  notes?: string;
}

export interface DoseLogUpdate {
  status?: DoseStatus;
  actual_time?: number;
  notes?: string;
}
