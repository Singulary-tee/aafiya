/**
 * Enhanced types for medication grouping and variant selection
 */

import { DrugConcept } from './api';

/**
 * Represents a group of medication variants with the same base name
 */
export interface MedicationGroup {
  baseName: string;
  variants: DrugConcept[];
  variantCount: number;
}

/**
 * Enhanced medication details including API data for offline access
 */
export interface EnhancedMedicationData {
  rxcui: string;
  name: string;
  genericName?: string;
  brandName?: string;
  dosageForm?: string;
  strength?: string;
  imageUrl?: string;
  usageInformation?: string;
  warnings?: string;
  storageInstructions?: string;
  description?: string;
}

/**
 * Result of parsing a medication name to extract components
 */
export interface ParsedMedicationName {
  baseName: string;
  strength?: string;
  form?: string;
  fullName: string;
}
