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
    created_at: number;
    updated_at: number;
}
