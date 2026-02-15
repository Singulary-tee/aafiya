/**
 * Represents a medication record in the database.
 */
export interface Medication {
    id: string;
    profile_id: string;
    rxcui?: string | null;
    name: string;
    generic_name?: string | null;
    brand_name?: string | null;
    dosage_form?: string | null;
    strength?: string | null;
    initial_count: number;
    current_count: number;
    image_url?: string | null;
    notes?: string | null;
    is_active: number; // 1 for true, 0 for false
    
    // Therapy tracking fields
    therapy_type?: 'limited' | null; // 'limited' for courses like antibiotics, null for ongoing
    therapy_duration?: number | null; // Number of days for limited therapy
    therapy_start_date?: number | null; // Unix timestamp when therapy started
    
    // Archive fields
    archived: number; // 1 for archived, 0 for active
    archived_at?: number | null; // Unix timestamp when archived
    
    // Pause/resume fields
    paused: number; // 1 for paused, 0 for active
    paused_at?: number | null; // Unix timestamp when paused
    pause_reason?: string | null; // Reason for pausing
    
    created_at: number;
    updated_at: number;
}
