/**
 * Represents a medication schedule in the database.
 */
export interface Schedule {
    id: string;
    medication_id: string;
    times: string[]; // Stored as JSON string in DB, but represented as array in the app
    days_of_week: number[] | null; // Stored as JSON string in DB, but represented as array/null in the app
    grace_period_minutes: number;
    notification_sound: string | null;
    is_active: number; // 1 for true, 0 for false
    created_at: number;
    updated_at: number;
}
