/**
 * HelperPairing Model
 * Represents the connection between a user and a remote helper
 */

export type PairingStatus = 'pending' | 'active' | 'inactive' | 'revoked';

export interface HelperPairing {
  id: string; // UUID v4, primary key
  profile_id: string; // Foreign key to Profile
  pairing_code: string; // The 6-digit code for establishing a connection
  helper_name: string; // Name of the connected helper
  status: PairingStatus; // pending, active, inactive, revoked
  expires_at: number; // Unix timestamp for pending code expiry
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface HelperPairingInput {
  profile_id: string;
  pairing_code: string;
  expires_at: number;
}

export interface HelperPairingUpdate {
  helper_name?: string;
  status?: PairingStatus;
}
