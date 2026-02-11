/**
 * ApiCache Model
 * Stores temporary data from external APIs to reduce network requests
 */

export interface ApiCache {
  key: string; // Unique identifier for the cached data (e.g., API endpoint + params)
  value: string; // The cached JSON response data
  expires_at: number; // Unix timestamp when the cache entry expires
}

export interface ApiCacheInput {
  key: string;
  value: string;
  expires_at: number;
}
