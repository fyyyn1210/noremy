interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number;
  }

  interface CacheStats {
    size: number;
    validEntries: number;
    expiredEntries: number;
    defaultTTL: number;
  }

  /**
   * Simple in-memory cache utility dengan TTL support
   */
  class CacheUtil<T = unknown> {
    private cache: Map<string, CacheEntry<T>>;
    private defaultTTL: number;
    private maxSize: number;
    private cleanupInterval: NodeJS.Timeout;

    constructor(defaultTTL: number, defaultMaxSize: number, cleanupInterval: number = 60 * 60 * 1000) {
      this.cache = new Map();
      this.defaultTTL = defaultTTL;
      this.maxSize = defaultMaxSize;

      // Auto cleanup setiap 1 jam
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, cleanupInterval);
    }

    /**
     * Set cache item
     * @param key - Cache key
     * @param value - Cache value
     * @param ttl - TTL in ms (null = use default)
     */
    set(key: string, value: T, ttl: number | null = null): void {
      if (this.cache.has(key)) {
        this.cache.delete(key); // refresh order
      } else if (this.maxSize && this.cache.size >= this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey !== undefined) {
          this.cache.delete(oldestKey);
        }
      }

      this.cache.set(key, {
        value,
        timestamp: Date.now(),
        ttl: ttl ?? this.defaultTTL,
      });
    }

    /**
     * Get cache item
     * @param key - Cache key
     * @returns Cached value atau null jika expired/tidak ada
     */
    get(key: string): T | null {
      const cached = this.cache.get(key);

      if (!cached) return null;

      const isExpired = Date.now() - cached.timestamp > cached.ttl;

      if (isExpired) {
        this.cache.delete(key);
        return null;
      }

      return cached.value;
    }

    /**
     * Check if key exists and not expired
     * @param key - Cache key
     */
    has(key: string): boolean {
      return this.get(key) !== null;
    }

    /**
     * Delete cache item
     * @param key - Cache key
     * @returns true jika berhasil delete
     */
    delete(key: string): boolean {
      return this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear(): void {
      this.cache.clear();
    }

    /**
     * Get multiple keys
     * @param keys - Array of cache keys
     * @returns Object dengan key-value pairs (null untuk yang tidak ada)
     */
    getMany(keys: string[]): Record<string, T | null> {
      const result: Record<string, T | null> = {};
      for (const key of keys) {
        result[key] = this.get(key);
      }
      return result;
    }

    /**
     * Set multiple keys
     * @param items - Object dengan key-value pairs
     * @param ttl - TTL in ms
     */
    setMany(items: Record<string, T>, ttl: number | null = null): void {
      for (const [key, value] of Object.entries(items)) {
        this.set(key, value, ttl);
      }
    }

    /**
     * Cleanup expired entries
     */
    cleanup(): number {
      const now = Date.now();
      let deleted = 0;

      for (const [key, cached] of this.cache.entries()) {
        if (now - cached.timestamp > cached.ttl) {
          this.cache.delete(key);
          deleted++;
        }
      }

      if (deleted > 0) {
        console.log(`🗑️  Cache cleanup: ${deleted} expired entries removed`);
      }

      return deleted;
    }

    /**
     * Get cache statistics
     */
    stats(): CacheStats {
      const now = Date.now();
      let validEntries = 0;
      let expiredEntries = 0;

      for (const [, cached] of this.cache.entries()) {
        if (now - cached.timestamp < cached.ttl) {
          validEntries++;
        } else {
          expiredEntries++;
        }
      }

      return {
        size: this.cache.size,
        validEntries,
        expiredEntries,
        defaultTTL: this.defaultTTL,
      };
    }

    /**
     * Destroy cache dan cleanup interval
     */
    destroy(): void {
      clearInterval(this.cleanupInterval);
      this.clear();
    }
  }

  export default CacheUtil;