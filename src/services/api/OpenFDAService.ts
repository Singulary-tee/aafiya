
import { OPENFDA_API } from '../../constants/api';
import { OpenFDAResponse } from '../../types/api';
import { logger } from '../../utils/logger';
import { RateLimiter } from './RateLimiter';
import { ApiCacheRepository } from '../../database/repositories/ApiCacheRepository';

const API_SOURCE = 'openfda';

/**
 * Service for interacting with the OpenFDA API.
 * It includes rate limiting and caching to respect API usage limits and improve performance.
 */
export class OpenFDAService {
    private rateLimiter: RateLimiter;
    private cache: ApiCacheRepository;

    constructor(cache: ApiCacheRepository) {
        this.rateLimiter = new RateLimiter(40, 60000); // 40 requests per minute
        this.cache = cache;
    }

    /**
     * Searches for a drug by its brand name using the OpenFDA /drug/label endpoint.
     * @param brandName The brand name of the drug.
     * @returns A promise that resolves to the API response.
     */
    async searchDrugByBrandName(brandName: string): Promise<OpenFDAResponse> {
        const query = `brand_name:${brandName}`;
        const cached = await this.cache.find(query, API_SOURCE);
        if (cached) {
            logger.log(`[OpenFDAService] Cache hit for "${brandName}"`);
            return cached;
        }

        await this.rateLimiter.wait();
        const url = OPENFDA_API.DRUG_LABEL(brandName);
        logger.log(`[OpenFDAService] Fetching from ${url}`);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch from OpenFDA: ${response.statusText}`);
            }
            const data: OpenFDAResponse = await response.json();
            
            await this.cache.cacheResponse(query, API_SOURCE, data);
            logger.log(`[OpenFDAService] Cached response for "${brandName}"`);
            
            return data;
        } catch (error) {
            logger.error(`[OpenFDAService] Error fetching drug label for "${brandName}":`, error);
            throw error;
        }
    }

    /**
     * Fetches drug information by its NDC (National Drug Code).
     * @param ndc The National Drug Code.
     * @returns A promise that resolves to the API response.
     */
    async searchByNdc(ndc: string): Promise<OpenFDAResponse> {
        const query = `ndc:${ndc}`;
        const cached = await this.cache.find(query, API_SOURCE);
        if (cached) {
            logger.log(`[OpenFDAService] Cache hit for NDC "${ndc}"`);
            return cached;
        }

        await this.rateLimiter.wait();
        const url = OPENFDA_API.NDC(ndc);
        logger.log(`[OpenFDAService] Fetching from ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch from OpenFDA: ${response.statusText}`);
            }
            const data: OpenFDAResponse = await response.json();

            await this.cache.cacheResponse(query, API_SOURCE, data);
            logger.log(`[OpenFDAService] Cached response for NDC "${ndc}"`);
            
            return data;
        } catch (error) {
            logger.error(`[OpenFDAService] Error fetching NDC data for "${ndc}":`, error);
            throw error;
        }
    }
}
