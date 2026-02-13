
import { logger } from '../../utils/logger';

/**
 * A class to manage the rate of API requests.
 * It ensures that the number of requests sent within a given time interval does not exceed a specified limit.
 */
export class RateLimiter {
    private limit: number;
    private interval: number;
    private requests: number[];

    /**
     * Creates a new RateLimiter.
     * @param limit The maximum number of requests allowed in the interval.
     * @param interval The time interval in milliseconds.
     */
    constructor(limit: number, interval: number) {
        this.limit = limit;
        this.interval = interval;
        this.requests = [];
    }

    /**
     * Checks if a new request is allowed and waits if necessary.
     * It cleans up old request timestamps and waits if the limit has been reached.
     * @returns A promise that resolves when the request can proceed.
     */
    async wait(): Promise<void> {
        this.cleanup();

        if (this.requests.length >= this.limit) {
            const now = Date.now();
            const earliestRequest = this.requests[0];
            const waitTime = this.interval - (now - earliestRequest);
            
            if (waitTime > 0) {
                logger.warn(`[RateLimiter] Rate limit reached. Waiting for ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            this.cleanup(); // Clean up again after waiting
        }

        this.requests.push(Date.now());
    }

    /**
     * Removes timestamps of requests that are outside the current time interval.
     */
    private cleanup(): void {
        const now = Date.now();
        this.requests = this.requests.filter(timestamp => now - timestamp < this.interval);
    }
}
