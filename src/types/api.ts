/**
 * API Response Types
 * Types for external API integrations (RxNorm, OpenFDA, DailyMed)
 */

// RxNorm API Types
export interface RxNormSearchResult {
  rxcui: string;
  name: string;
  synonym?: string;
  tty: string; // TTY (Term Type)
}

export interface RxNormConceptResult {
  rxcui: string;
  name: string;
  synonym: string[];
  strength?: string;
  doseForm?: string;
  route?: string;
}

// DailyMed API Types
export interface DailyMedMedication {
  id: string;
  name: string;
  image_url?: string;
  strength?: string;
  form?: string;
  manufacturer?: string;
}

// OpenFDA API Types (for future drug interaction checking)
export interface DrugInteraction {
  severity: 'minor' | 'moderate' | 'major';
  effect: string;
  mechanism: string;
}

// Generic API Cache
export interface ApiCacheEntry {
  id: string;
  key: string; // Cache key derived from query
  data: unknown; // Cached response
  expires_at: number; // Unix timestamp
  created_at: number; // Unix timestamp
}
