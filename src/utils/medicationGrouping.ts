/**
 * Utility functions for grouping and parsing medication names
 */

import { DrugConcept } from '../types/api';
import { MedicationGroup, ParsedMedicationName } from '../types/medication';

/**
 * Common dosage units to strip from medication names
 */
const DOSAGE_UNITS = [
  'mg', 'mcg', 'g', 'ml', 'mL', 'L',
  'units', 'unit', 'iu', 'IU',
  '%', 'mg/ml', 'mcg/ml', 'units/ml'
];

/**
 * Common form descriptors to strip from medication names
 */
const FORM_DESCRIPTORS = [
  'tablet', 'tablets', 'tab', 'tabs',
  'capsule', 'capsules', 'cap', 'caps',
  'solution', 'sol', 'injection', 'inj',
  'pen', 'pens', 'vial', 'vials',
  'patch', 'patches', 'cream', 'ointment',
  'syrup', 'suspension', 'powder',
  'oral', 'topical', 'transdermal',
  'extended-release', 'er', 'xr', 'sr',
  'delayed-release', 'dr'
];

/**
 * Parse a medication name to extract base name, strength, and form
 * @param name Full medication name
 * @returns Parsed components
 */
export function parseMedicationName(name: string): ParsedMedicationName {
  const fullName = name.trim();
  let baseName = fullName;
  let strength: string | undefined;
  let form: string | undefined;

  // Extract strength (numbers with units)
  const strengthMatch = fullName.match(/(\d+(\.\d+)?)\s*(mg|mcg|g|ml|mL|L|units?|iu|IU|%|mg\/ml|mcg\/ml|units\/ml)/i);
  if (strengthMatch) {
    strength = strengthMatch[0].trim();
    baseName = baseName.replace(strengthMatch[0], '').trim();
  }

  // Extract form descriptor
  const formPattern = new RegExp(`\\b(${FORM_DESCRIPTORS.join('|')})\\b`, 'i');
  const formMatch = fullName.match(formPattern);
  if (formMatch) {
    form = formMatch[0].trim();
    baseName = baseName.replace(formMatch[0], '').trim();
  }

  // Clean up remaining artifacts
  baseName = baseName
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/[,\-\/]+$/, '') // Trailing punctuation
    .trim();

  return {
    baseName,
    strength,
    form,
    fullName
  };
}

/**
 * Group medications by their base name
 * @param concepts Array of drug concepts from API
 * @returns Array of medication groups
 */
export function groupMedications(concepts: DrugConcept[]): MedicationGroup[] {
  if (!concepts || concepts.length === 0) {
    return [];
  }

  // Group by base name
  const groupMap = new Map<string, DrugConcept[]>();

  for (const concept of concepts) {
    const parsed = parseMedicationName(concept.name);
    const baseName = parsed.baseName.toLowerCase();

    if (!groupMap.has(baseName)) {
      groupMap.set(baseName, []);
    }
    groupMap.get(baseName)!.push(concept);
  }

  // Convert to array of MedicationGroup
  const groups: MedicationGroup[] = [];
  groupMap.forEach((variants, baseName) => {
    // Use the first variant's parsed name for display
    const displayName = parseMedicationName(variants[0].name).baseName;
    
    groups.push({
      baseName: displayName,
      variants: variants.sort((a, b) => a.name.localeCompare(b.name)),
      variantCount: variants.length
    });
  });

  // Sort groups alphabetically
  return groups.sort((a, b) => a.baseName.localeCompare(b.baseName));
}

/**
 * Extract strength from a medication name
 * @param name Medication name
 * @returns Strength string or undefined
 */
export function extractStrength(name: string): string | undefined {
  const parsed = parseMedicationName(name);
  return parsed.strength;
}

/**
 * Extract form from a medication name
 * @param name Medication name
 * @returns Form string or undefined
 */
export function extractForm(name: string): string | undefined {
  const parsed = parseMedicationName(name);
  return parsed.form;
}

/**
 * Determine if a medication name represents a brand name
 * Brand names typically start with a capital letter and don't contain common generic indicators
 * @param name Medication name
 * @returns True if likely a brand name
 */
export function isBrandName(name: string): boolean {
  const parsed = parseMedicationName(name);
  const base = parsed.baseName;
  
  // Check if base is empty
  if (!base || base.length === 0) {
    return false;
  }
  
  // Brand names typically:
  // 1. Start with capital letter
  // 2. Don't contain common generic suffixes
  const genericIndicators = ['-', 'hydrochloride', 'sulfate', 'sodium', 'potassium'];
  const hasGenericIndicator = genericIndicators.some(indicator => 
    base.toLowerCase().includes(indicator)
  );
  
  return base[0] === base[0].toUpperCase() && !hasGenericIndicator;
}
