
import { RXNORM_API } from '../../constants/api';
import { RxNormResponse, RxNormPropertiesResponse } from '../../types/api';
import { logger } from '../../utils/logger';
import { RateLimiter } from './RateLimiter';
import { ApiCacheRepository } from '../../database/repositories/ApiCacheRepository';

const API_SOURCE = 'rxnorm';

/**
 * Service for interacting with the RxNorm API.
 * Handles API requests for drug information, with rate limiting and caching.
 */
export class RxNormService {
    private rateLimiter: RateLimiter;
    private cache: ApiCacheRepository;

    constructor(cache: ApiCacheRepository) {
        // RxNorm has a lower rate limit, so we adjust accordingly.
        this.rateLimiter = new RateLimiter(20, 60000); // 20 requests per minute
        this.cache = cache;
    }

    /**
     * Finds drugs by name using the /drugs endpoint.
     * @param name The name of the drug to search for.
     * @returns A promise that resolves to the API response.
     */
    async findDrugsByName(name: string): Promise<RxNormResponse> {
        const query = `name:${name}`;
        const cached = await this.cache.find(query, API_SOURCE);
        if (cached) {
            logger.log(`[RxNormService] Cache hit for "${name}"`);
            return cached;
        }

        await this.rateLimiter.wait();
        const url = `${RXNORM_API.DRUGS}?name=${encodeURIComponent(name)}`;
        logger.log(`[RxNormService] Fetching from ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch from RxNorm: ${response.statusText}`);
            }
            const data: RxNormResponse = await response.json();

            await this.cache.cacheResponse(query, API_SOURCE, data);
            logger.log(`[RxNormService] Cached response for "${name}"`);

            return data;
        } catch (error) {
            logger.error(`[RxNormService] Error fetching drugs for "${name}":`, error);
            throw error;
        }
    }

    /**
     * Retrieves properties for a given RxCUI (RxNorm Concept Unique Identifier).
     * @param rxcui The RxCUI of the drug concept.
     * @returns A promise that resolves to the properties of the concept.
     */
    async getProperties(rxcui: string): Promise<RxNormPropertiesResponse> {
        const query = `rxcui:${rxcui}:properties`;
        const cached = await this.cache.find(query, API_SOURCE);
        if (cached) {
            logger.log(`[RxNormService] Cache hit for properties of RxCUI "${rxcui}"`);
            return cached;
        }

        await this.rateLimiter.wait();
        const url = RXNORM_API.PROPERTIES(rxcui);
        logger.log(`[RxNormService] Fetching from ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch from RxNorm: ${response.statusText}`);
            }
            const data: RxNormPropertiesResponse = await response.json();

            await this.cache.cacheResponse(query, API_SOURCE, data);
            logger.log(`[RxNormService] Cached properties for RxCUI "${rxcui}"`);

            return data;
        } catch (error) {
            logger.error(`[RxNormService] Error fetching properties for RxCUI "${rxcui}":`, error);
            throw error;
        }
    }

    /**
     * Gets related drug concepts for a given RxCUI, filtered by term type (tty).
     * @param rxcui The RxCUI to find related concepts for.
     * @param tty A list of term types to filter by (e.g., ['IN', 'BN'] for ingredients and brand names).
     * @returns A promise that resolves to the related concepts.
     */
    async getRelatedConcepts(rxcui: string, tty: string[]): Promise<any> {
        const ttyString = tty.join('+');
        const query = `rxcui:${rxcui}:related:tty=${ttyString}`;
        const cached = await this.cache.find(query, API_SOURCE);
        if (cached) {
            logger.log(`[RxNormService] Cache hit for related concepts of RxCUI "${rxcui}" with TTYs "${ttyString}"`);
            return cached;
        }

        await this.rateLimiter.wait();
        const url = RXNORM_API.RELATED(rxcui, ttyString);
        logger.log(`[RxNormService] Fetching from ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch from RxNorm: ${response.statusText}`);
            }
            const data = await response.json();

            await this.cache.cacheResponse(query, API_SOURCE, data);
            logger.log(`[RxNormService] Cached related concepts for RxCUI "${rxcui}"`);

            return data;
        } catch (error) {
            logger.error(`[RxNormService] Error fetching related concepts for RxCUI "${rxcui}":`, error);
            throw error;
        }
    }
}
