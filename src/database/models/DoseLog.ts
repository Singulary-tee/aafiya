/**
 * Represents a single dose event in the database.
 */
export interface DoseLog {
    id: string;
    medication_id: string;
    schedule_id: string;
    scheduled_time: number;
    actual_time: number | null;
    status: 'taken' | 'missed' | 'skipped';
    notes: string | null;
    created_at: number;
}
