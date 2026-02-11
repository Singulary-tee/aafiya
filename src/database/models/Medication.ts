/**
 * Medication Model
 * Represents a medication tracked by the application
 */

export interface Medication {
  id: string; // UUID v4
  profile_id: string; // Foreign key to Profile
  rxcui?: string; // RxNorm Concept Unique Identifier
  name: string; // 1-200 characters, required
  generic_name?: string;
  brand_name?: string;
  dosage_form?: string; // e.g., "tablet", "capsule"
  strength?: string; // e.g., "500mg"
  initial_count: number; // Starting pill count, >= 0
  current_count: number; // Remaining pills, >= 0 and <= initial_count
  image_url?: string; // Local file path or DailyMed URL
  notes?: string;
  is_active: number; // Boolean: 1=active, 0=archived
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface MedicationInput {
  name: string;
  dosage_form?: string;
  strength?: string;
  initial_count: number;
  generic_name?: string;
  brand_name?: string;
  image_url?: string;
  notes?: string;
  rxcui?: string;
}

export interface MedicationUpdate {
  name?: string;
  dosage_form?: string;
  strength?: string;
  current_count?: number;
  initial_count?: number;
  notes?: string;
  is_active?: number;
}
