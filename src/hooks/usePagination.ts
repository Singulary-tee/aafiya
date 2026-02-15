import { useState, useCallback, useEffect } from 'react';
import { logger } from '../utils/logger';

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  initialLimit?: number;
  loadMoreThreshold?: number; // How many items from end to trigger load
}

/**
 * Pagination state
 */
export interface PaginationState {
  limit: number;
  offset: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
  items: T[];
  pagination: PaginationState;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  resetPagination: () => void;
}

/**
 * Hook for implementing pagination with database queries.
 * 
 * Usage:
 * ```typescript
 * const fetchFn = useCallback(async (limit, offset) => {
 *   return await repository.findAll(limit, offset);
 * }, [repository]);
 * 
 * const { items, pagination, loadMore, refresh } = usePagination(
 *   fetchFn,
 *   { initialLimit: 20 }
 * );
 * ```
 */
export function usePagination<T>(
  fetchFunction: (limit: number, offset: number) => Promise<T[]>,
  config: PaginationConfig = {}
): PaginationResult<T> {
  const { initialLimit = 30, loadMoreThreshold = 5 } = config;
  
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    limit: initialLimit,
    offset: 0,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
  });

  /**
   * Loads initial page
   */
  const loadInitial = useCallback(async () => {
    if (pagination.isLoading) return;
    
    setPagination(prev => ({ ...prev, isLoading: true }));
    
    try {
      const results = await fetchFunction(initialLimit, 0);
      setItems(results);
      setPagination(prev => ({
        ...prev,
        offset: results.length,
        hasMore: results.length === initialLimit,
        isLoading: false,
      }));
    } catch (error) {
      logger.error('Failed to load initial page:', error);
      setPagination(prev => ({ ...prev, isLoading: false }));
    }
  }, [fetchFunction, initialLimit, pagination.isLoading]);

  /**
   * Loads next page of results
   */
  const loadMore = useCallback(async () => {
    const { hasMore, isLoadingMore, isLoading, limit, offset } = pagination;
    
    if (!hasMore || isLoadingMore || isLoading) {
      return;
    }
    
    setPagination(prev => ({ ...prev, isLoadingMore: true }));
    
    try {
      const results = await fetchFunction(limit, offset);
      
      setItems(prev => [...prev, ...results]);
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + results.length,
        hasMore: results.length === limit,
        isLoadingMore: false,
      }));
    } catch (error) {
      logger.error('Failed to load more:', error);
      setPagination(prev => ({ ...prev, isLoadingMore: false }));
    }
  }, [fetchFunction, pagination]);

  /**
   * Refreshes from beginning
   */
  const refresh = useCallback(async () => {
    setPagination({
      limit: initialLimit,
      offset: 0,
      hasMore: true,
      isLoading: false,
      isLoadingMore: false,
    });
    await loadInitial();
  }, [loadInitial, initialLimit]);

  /**
   * Resets pagination state without loading
   */
  const resetPagination = useCallback(() => {
    setItems([]);
    setPagination({
      limit: initialLimit,
      offset: 0,
      hasMore: true,
      isLoading: false,
      isLoadingMore: false,
    });
  }, [initialLimit]);

  // Load initial page on mount
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    items,
    pagination,
    loadMore,
    refresh,
    resetPagination,
  };
}

/**
 * Helper to determine if we should load more based on scroll position.
 * Use with FlatList's onEndReached.
 */
export function shouldLoadMore(
  currentIndex: number,
  totalItems: number,
  threshold: number = 5
): boolean {
  return currentIndex >= totalItems - threshold;
}

/**
 * Infinite scroll configuration for FlatList
 */
export function getInfiniteScrollProps(
  loadMore: () => Promise<void>,
  isLoadingMore: boolean
) {
  return {
    onEndReached: () => {
      if (!isLoadingMore) {
        loadMore();
      }
    },
    onEndReachedThreshold: 0.5, // Trigger when 50% from end
    ListFooterComponent: isLoadingMore ? <LoadingFooter /> : null,
  };
}

/**
 * Simple loading footer component for lists
 */
function LoadingFooter() {
  // This would typically be a proper component with ActivityIndicator
  return null; // Placeholder
}
