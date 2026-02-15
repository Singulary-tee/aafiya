/**
 * Service for enriching medication data with information from multiple APIs
 */

import { DailyMedService } from '../services/api/DailyMedService';
import { OpenFDAService } from '../services/api/OpenFDAService';
import { RxNormService } from '../services/api/RxNormService';
import { ApiCacheRepository } from '../database/repositories/ApiCacheRepository';
import { EnhancedMedicationData } from '../types/medication';
import { logger } from './logger';
import { parseMedicationName } from './medicationGrouping';

/**
 * Fetch comprehensive medication data from multiple sources
 * @param rxcui RxNorm Concept Unique Identifier
 * @param name Medication name
 * @param cache API cache repository
 * @returns Enhanced medication data
 */
export async function fetchEnhancedMedicationData(
  rxcui: string | null,
  name: string,
  cache: ApiCacheRepository
): Promise<EnhancedMedicationData> {
  const parsed = parseMedicationName(name);
  
  const enhancedData: EnhancedMedicationData = {
    rxcui: rxcui || '',
    name: name,
    dosageForm: parsed.form,
    strength: parsed.strength,
  };

  try {
    // Try to get properties from RxNorm if we have an RXCUI
    if (rxcui) {
      const rxNormService = new RxNormService(cache);
      const properties = await rxNormService.getProperties(rxcui);
      
      if (properties.propertiesGroup?.propConcept) {
        for (const prop of properties.propertiesGroup.propConcept) {
          if (prop.propName === 'RxNorm Name') {
            enhancedData.name = prop.propValue;
          }
        }
      }
    }

    // Try to fetch from OpenFDA
    const openFDAService = new OpenFDAService(cache);
    try {
      const fdaResponse = await openFDAService.searchDrugByBrandName(parsed.baseName);
      if (fdaResponse.results && fdaResponse.results.length > 0) {
        const result = fdaResponse.results[0];
        
        if (result.openfda.generic_name && result.openfda.generic_name.length > 0) {
          enhancedData.genericName = result.openfda.generic_name[0];
        }
        
        if (result.openfda.brand_name && result.openfda.brand_name.length > 0) {
          enhancedData.brandName = result.openfda.brand_name[0];
        }
        
        if (result.description && result.description.length > 0) {
          enhancedData.description = result.description[0];
        }
      }
    } catch (fdaError) {
      logger.log('[fetchEnhancedMedicationData] OpenFDA fetch failed, continuing...', fdaError);
    }

    // Try to fetch image from DailyMed
    const dailyMedService = new DailyMedService(cache);
    try {
      const splsResponse = await dailyMedService.getSpls(parsed.baseName);
      if (splsResponse.data && splsResponse.data.length > 0) {
        const setid = splsResponse.data[0].setid;
        
        // Fetch media for the first SPL
        const mediaResponse = await dailyMedService.getMedia(setid);
        if (mediaResponse.data && mediaResponse.data.length > 0) {
          // Find first image
          const image = mediaResponse.data.find(m => m.mimetype.startsWith('image/'));
          if (image) {
            enhancedData.imageUrl = image.url;
          }
        }
      }
    } catch (dailyMedError) {
      logger.log('[fetchEnhancedMedicationData] DailyMed fetch failed, continuing...', dailyMedError);
    }

  } catch (error) {
    logger.error('[fetchEnhancedMedicationData] Error fetching enhanced data:', error);
  }

  return enhancedData;
}

/**
 * Generate usage information placeholder
 */
export function generateUsageInformation(medicationName: string): string {
  return `Please consult your healthcare provider for specific usage information about ${medicationName}.`;
}

/**
 * Generate warnings placeholder
 */
export function generateWarnings(): string {
  return 'Always follow your healthcare provider\'s instructions. Contact your doctor if you experience any adverse effects.';
}

/**
 * Generate storage instructions placeholder
 */
export function generateStorageInstructions(): string {
  return 'Store at room temperature away from moisture and heat. Keep out of reach of children.';
}
