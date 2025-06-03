import Redis from "ioredis";
import logger from "./logger";

class CacheService {
  private redis: Redis | null = null;
  private isConnected = false;
  private useRedis = false; // Disable Redis

  constructor() {
    // Comment out Redis initialization
    // this.initializeRedis();
  }

  private initializeRedis() {
    // Redis initialization disabled
    return;
  }

  async get(key: string): Promise<any> {
    // Always return null when Redis is disabled
    return null;
  }

  async set(
    key: string,
    value: any,
    expirationInSeconds = 3600
  ): Promise<boolean> {
    // Always return false when Redis is disabled
    return false;
  }

  async delete(key: string): Promise<boolean> {
    // Always return false when Redis is disabled
    return false;
  }

  async deletePattern(pattern: string): Promise<boolean> {
    // Always return false when Redis is disabled
    return false;
  }

  async exists(key: string): Promise<boolean> {
    // Always return false when Redis is disabled
    return false;
  }

  async increment(key: string, increment = 1): Promise<number> {
    // Always return 0 when Redis is disabled
    return 0;
  }

  async setHash(key: string, field: string, value: any): Promise<boolean> {
    // Always return false when Redis is disabled
    return false;
  }

  async getHash(key: string, field: string): Promise<any> {
    // Always return null when Redis is disabled
    return null;
  }

  async getAllHash(key: string): Promise<Record<string, any> | null> {
    // Always return null when Redis is disabled
    return null;
  }

  // Method to cache database queries - now just executes the query directly
  async cacheQuery(
    key: string,
    queryFunction: () => Promise<any>,
    expirationInSeconds = 3600
  ): Promise<any> {
    try {
      // When Redis is disabled, just execute the query directly
      return await queryFunction();
    } catch (error) {
      logger.error(`Error in query execution for key ${key}:`, error);
      throw error;
    }
  }

  isRedisConnected(): boolean {
    return false; // Always return false when disabled
  }

  async flushAll(): Promise<boolean> {
    // Always return false when Redis is disabled
    return false;
  }
}

export default new CacheService();
