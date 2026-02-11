/**
 * DoseLog Model
 * Records dose-taking history for tracking and statistics
 */

export type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped' | 'late';

export interface DoseLog {
  id: string; // UUID v4
  schedule_id: string; // Foreign key to Schedule
  medication_id: string; // Foreign key to Medication (denormalized for queries)
  profile_id: string; // Foreign key to Profile
  status: DoseStatus; // pending, taken, missed, skipped, late
  scheduled_time: number; // Unix timestamp of scheduled time
  actual_time?: number; // Unix timestamp when actually taken (if taken)
  notes?: string; // Optional user notes
  is_auto_marked_missed: number; // Boolean: 1=auto, 0=manual
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface DoseLogInput {
  schedule_id: string;
  medication_id: string;
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
