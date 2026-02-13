
import { DAILYMED_API } from '../../constants/api';
import { DailyMedSPLsResponse, DailyMedMediaResponse } from '../../types/api';
import { logger } from '../../utils/logger';
import { RateLimiter } from './RateLimiter';
import { ApiCacheRepository } from '../../database/repositories/ApiCacheRepository';

const API_SOURCE = 'dailymed';

/**
 * Service for interacting with the DailyMed API.
 * It includes rate limiting and caching to respect API usage limits and improve performance.
 */
export class DailyMedService {
    private rateLimiter: RateLimiter;
    private cache: ApiCacheRepository;

    constructor(cache: ApiCacheRepository) {
        // Using a conservative rate limit as the official limit is not explicitly stated
        this.rateLimiter = new RateLimiter(30, 60000); // 30 requests per minute
        this.cache = cache;
    }

    /**
     * Searches for drug SPLs (Structured Product Labeling) by drug name.
     * @param drugName The name of the drug to search for.
     * @returns A promise that resolves to the SPL search results.
     */
    async getSpls(drugName: string): Promise<DailyMedSPLsResponse> {
        const query = `drug_name:${drugName}`;
        const cached = await this.cache.find(query, API_SOURCE);
        if (cached) {
            logger.log(`[DailyMedService] Cache hit for SPLs of "${drugName}"`);
            return cached;
        }

        await this.rateLimiter.wait();
        const url = DAILYMED_API.SPLS(drugName);
        logger.log(`[DailyMedService] Fetching from ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch from DailyMed: ${response.statusText}`);
            }
            const data: DailyMedSPLsResponse = await response.json();

            await this.cache.cacheResponse(query, API_SOURCE, data);
            logger.log(`[DailyMedService] Cached SPLs for "${drugName}"`);

            return data;
        } catch (error) {
            logger.error(`[DailyMedService] Error fetching SPLs for "${drugName}":`, error);
            throw error;
        }
    }

    /**
     * Fetches media (such as pill images) associated with a specific SPL document.
     * @param setid The Set ID of the SPL document.
     * @returns A promise that resolves to the media resources.
     */
    async getMedia(setid: string): Promise<DailyMedMediaResponse> {
        const query = `setid:${setid}`;
        const cached = await this.cache.find(query, API_SOURCE);
        if (cached) {
            logger.log(`[DailyMedService] Cache hit for media of setid "${setid}"`);
            return cached;
        }

        await this.rateLimiter.wait();
        const url = DAILYMED_API.MEDIA(setid);
        logger.log(`[DailyMedService] Fetching from ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch from DailyMed: ${response.statusText}`);
            }
            const data: DailyMedMediaResponse = await response.json();

            await this.cache.cacheResponse(query, API_SOURCE, data);
            logger.log(`[DailyMedService] Cached media for setid "${setid}"`);

            return data;
        } catch (error) {
            logger.error(`[DailyMedService] Error fetching media for setid "${setid}":`, error);
            throw error;
        }
    }
}
