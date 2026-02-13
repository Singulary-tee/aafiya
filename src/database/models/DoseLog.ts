
/**
 * Represents a single dose of medication taken by a user.
 */
export interface DoseLog {
    /** The unique identifier for the dose log. */
    id: string;

    /** The ID of the profile taking the dose. */
    profile_id: string;

    /** The ID of the medication being taken. */
    medication_id: string;

    /** The ID of the schedule this dose corresponds to, if any. */
    schedule_id: string | null;

    /** The time the dose was scheduled to be taken. */
    scheduled_time: number;

    /** The time the dose was actually taken, if taken. */
    actual_time: number | null;

    /** The status of the dose (e.g., 'taken', 'skipped', 'missed'). */
    status: 'taken' | 'skipped' | 'missed' | 'pending';

    /** Any notes associated with this dose. */
    notes: string | null;

    /** The timestamp when this log was created. */
    created_at: number;

    /** The timestamp when this log was last updated. */
    updated_at: number;
}
