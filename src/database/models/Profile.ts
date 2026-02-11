/**
 * Profile Model
 * Represents a user profile in the medication tracker
 */

export interface Profile {
  id: string; // UUID v4
  name: string; // 1-50 characters
  avatar_color: string; // Hex color code (#RRGGBB)
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface ProfileInput {
  name: string;
  avatar_color: string;
}

export interface ProfileUpdate {
  name?: string;
  avatar_color?: string;
}
