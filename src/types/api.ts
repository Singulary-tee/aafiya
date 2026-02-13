/**
 * This file contains TypeScript types for external API responses.
 */

// --- RxNorm API ---

/**
 * A single concept property from the RxNorm API.
 */
export interface RxNormConceptProperty {
  rxcui: string;
  name: string;
  synonym: string;
}

/**
 * A group of concepts from the RxNorm API, categorized by term type (tty).
 */
export interface RxNormConceptGroup {
  tty: string;
  conceptProperties?: RxNormConceptProperty[];
}

/**
 * The top-level structure of a response from the /drugs endpoint.
 */
export interface RxNormResponse {
  drugGroup: {
    name?: string;
    conceptGroup: RxNormConceptGroup[];
  };
}

// --- OpenFDA API ---

/**
 * Represents a single result from the OpenFDA drug label API.
 */
export interface OpenFDAResult {
  id: string;
  openfda: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_ndc?: string[];
    spl_set_id?: string[];
  };
  description?: string[];
}

/**
 * The top-level structure of a response from the OpenFDA API.
 */
export interface OpenFDAResponse {
  results: OpenFDAResult[];
}

// --- DailyMed API ---

/**
 * Represents a single SPL document from the DailyMed API.
 */
export interface DailyMedSPL {
    setid: string;
    title: string;
}

/**
 * The response structure for the SPLs endpoint.
 */
export interface DailyMedSPLsResponse {
    data: DailyMedSPL[];
}

/**
 * Represents a media item (like a pill image) from the DailyMed API.
 */
export interface DailyMedMedia {
    url: string;
    mimetype: string;
    name: string;
}

/**
 * The response structure for the media endpoint.
 */
export interface DailyMedMediaResponse {
    data: DailyMedMedia[];
}
