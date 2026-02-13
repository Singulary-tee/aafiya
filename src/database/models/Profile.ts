/**
 * Represents a user profile in the database.
 */
export interface Profile {
    id: string;
    name: string;
    avatar_color: string;
    created_at: number;
    updated_at: number;
}
