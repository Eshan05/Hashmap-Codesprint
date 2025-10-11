import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
const LOG_PREFIX = '[RedisUtils]';

// --- Basic Operations with Error Handling & Logging ---

/**
 * Sets a value in Redis, optionally with an expiration time.
 * Handles JSON serialization.
 * @param key The Redis key.
 * @param value The value to store (will be JSON.stringified).
 * @param ttlSeconds Optional expiration time in seconds.
 * @returns True if set successfully, false otherwise.
 */
export async function redisSet<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(value);
    let result: string | null;
    if (ttlSeconds && ttlSeconds > 0) {
      // Positional arguments for EX
      result = await redis.set(key, jsonValue, 'EX', Math.ceil(ttlSeconds));
    } else {
      result = await redis.set(key, jsonValue);
    }
    // redis.set returns "OK" on success
    if (result !== 'OK') {
      logger.warn(`${LOG_PREFIX} SET command for key "${key}" did not return OK. Result: ${result}`);
    }
    logger.debug(`${LOG_PREFIX} Set key "${key}"${ttlSeconds ? ` with TTL ${ttlSeconds}s` : ''}.`);
    return true; // Indicate the operation was attempted without throwing
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error setting key "${key}":`, error);
    return false; // Indicate failure
  }
}

/**
 * Gets and parses a JSON value from Redis.
 * @param key The Redis key.
 * @returns The parsed value, or null if key doesn't exist or parsing fails.
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  try {
    const rawValue = await redis.get(key);
    if (rawValue === null) {
      // Key doesn't exist, this is not an error
      logger.debug(`${LOG_PREFIX} Cache miss for key "${key}".`);
      return null;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as T;
      logger.debug(`${LOG_PREFIX} Cache hit for key "${key}".`);
      return parsedValue;
    } catch (parseError) {
      logger.error(`${LOG_PREFIX} Failed to parse JSON for key "${key}". Value: "${rawValue}". Error:`, parseError);
      return null; // Parsing failed
    }
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error getting key "${key}":`, error);
    return null; // Redis error
  }
}

/**
 * Deletes one or more keys from Redis.
 * @param keys A single key or an array of keys.
 * @returns The number of keys deleted, or -1 on error.
 */
export async function redisDel(keys: string | string[]): Promise<number> {
  const keysToDelete = Array.isArray(keys) ? keys : [keys];
  if (keysToDelete.length === 0) return 0;

  try {
    const count = await redis.del(keysToDelete);
    // logger.debug(`${LOG_PREFIX} Deleted ${count} keys: ${keysToDelete.join(', ')}.`);
    return count;
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error deleting keys "${keysToDelete.join(', ')}":`, error);
    return -1; // Indicate error
  }
}

/**
 * Checks if one or more keys exist in Redis.
 * @param keys A single key or an array of keys.
 * @returns The number of keys that exist, or -1 on error.
 */
export async function redisExists(keys: string | string[]): Promise<number> {
  const keysToCheck = Array.isArray(keys) ? keys : [keys];
  if (keysToCheck.length === 0) return 0;
  try {
    const count = await redis.exists(keysToCheck);
    return count;
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error checking existence for keys "${keysToCheck.join(', ')}":`, error);
    return -1; // Indicate error
  }
}

/**
 * Increments the integer value of a key by one. Creates key at 0 if it doesn't exist.
 * @param key The Redis key.
 * @returns The value after incrementing, or null on error.
 */
export async function redisIncr(key: string): Promise<number | null> {
  try {
    const newValue = await redis.incr(key);
    return newValue;
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error incrementing key "${key}":`, error);
    return null;
  }
}

/**
 * Sets an expiration time (TTL) on a key.
 * @param key The Redis key.
 * @param ttlSeconds The expiration time in seconds. Must be > 0.
 * @returns True if expiration was set, false otherwise (EX: key doesn't exist or error).
 */
export async function redisExpire(key: string, ttlSeconds: number): Promise<boolean> {
  if (ttlSeconds <= 0) {
    logger.warn(`${LOG_PREFIX} Attempted to set non-positive TTL (${ttlSeconds}s) for key "${key}".`);
    return false;
  }
  try {
    const result = await redis.expire(key, Math.ceil(ttlSeconds));
    // Returns 1 if timeout was set, 0 if key does not exist or timeout could not be set.
    return result === 1;
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error setting expiration for key "${key}":`, error);
    return false;
  }
}

/**
 * WARNING: Deletes ALL keys from the CURRENTLY SELECTED Redis database. Use with extreme caution!
 * Consider disabling this in production environments.
 * @returns True if successful, false otherwise.
 */
export async function redisFlushDb(): Promise<boolean> {
  logger.warn(`${LOG_PREFIX} Executing FLUSHDB! This will delete all keys in the current database.`);
  // Add extra confirmation or environment check if needed:
  // if (process.env.NODE_ENV === 'production') {
  //   logger.error(`${LOG_PREFIX} FLUSHDB is disabled in this environment.`);
  //   return false;
  // }
  try {
    const result = await redis.flushdb();
    return result === 'OK';
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error executing FLUSHDB:`, error);
    return false;
  }
}

/**
 * WARNING: Deletes ALL keys from ALL Redis databases.
 * Strongly consider disabling this entirely.
 * @returns True if successful, false otherwise.
 */
export async function redisFlushAll(): Promise<boolean> {
  logger.error(`${LOG_PREFIX} Executing FLUSHALL! This is highly destructive.`);
  // Add extra confirmation or environment check:
  // if (process.env.NODE_ENV === 'production') {
  //   logger.error(`${LOG_PREFIX} FLUSHALL is disabled in this environment.`);
  //   return false;
  // }
  // Consider adding a mandatory confirmation step in non-test environments.

  try {
    const result = await redis.flushall();
    return result === 'OK';
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error executing FLUSHALL:`, error);
    return false;
  }
}


// --- Caching Pattern ---

/**
 * Cache-Aside pattern: Tries to get data from cache. If missed,
 * calls the fetcher function, caches the result, and returns it.
 * Handles errors during fetch or cache set gracefully.
 * @param key Cache key.
 * @param fetcher Async function to get data if cache misses.
 * @param ttlSeconds Cache TTL in seconds.
 * @returns The data (from cache or fetcher), or null if fetcher fails and cache is empty.
 */
export async function withRedisCache<T>(
  key: string,
  fetcher: () => Promise<T | null>, // Allow fetcher to return null
  ttlSeconds = 60 * 5 // Default to 5 minutes
): Promise<T | null> {
  const cached = await redisGet<T>(key);
  if (cached !== null) {
    // logger.debug(`${LOG_PREFIX} Cache hit for ${key}`);
    return cached;
  }

  // 2. Cache miss: Call the fetcher
  try {
    logger.debug(`${LOG_PREFIX} Cache miss for ${key}. Fetching...`);
    const data = await fetcher();
    // Fetcher succeeded and returned data, cache it
    if (data !== null) {
      logger.debug(`${LOG_PREFIX} Fetched data for ${key}. Caching...`);
      // Use await but don't block return on cache success; log error if it fails
      redisSet(key, data, ttlSeconds).catch(cacheErr => {
        logger.error(`${LOG_PREFIX} Failed to cache data for key ${key} after fetching:`, cacheErr);
      });
    } else {
      logger.debug(`${LOG_PREFIX} Fetcher returned null for key ${key}. Not caching.`);
    }

    return data;
  } catch (fetcherError) {
    logger.error(`${LOG_PREFIX} Error in fetcher function for cache key "${key}":`, fetcherError);
    return null;
  }
}


// --- Locking Pattern ---

/**
 * Attempts to acquire a distributed lock using Redis SET NX PX.
 * @param key The lock key.
 * @param lockOwner A unique identifier for the process holding the lock.
 * @param ttlMs The lock's time-to-live in milliseconds.
 * @returns True if the lock was acquired, false otherwise or on error.
 */
export async function redisAcquireLock(
  key: string,
  lockOwner: string, // Store who owns the lock
  ttlMs: number
): Promise<boolean> {
  if (ttlMs <= 0) {
    logger.warn(`${LOG_PREFIX} Attempted to acquire lock "${key}" with non-positive TTL (${ttlMs}ms).`);
    return false;
  }
  try {
    // Use positional arguments: PX for milliseconds, NX for "set if not exists"
    const result = await redis.set(key, lockOwner, 'PX', ttlMs, 'NX');
    const acquired = result === 'OK';
    if (acquired) logger.debug(`${LOG_PREFIX} Lock acquired for key "${key}" by ${lockOwner}.`);
    else logger.debug(`${LOG_PREFIX} Failed to acquire lock for key "${key}" (already held?).`);
    return acquired;
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error acquiring lock for key "${key}":`, error);
    return false;
  }
}

/**
 * Releases a distributed lock if the provided owner still holds it.
 * Uses a Lua script for atomicity (check owner and delete).
 * @param key The lock key.
 * @param lockOwner The unique identifier that acquired the lock.
 * @returns True if the lock was released by this owner, false otherwise or on error.
 */
export async function redisReleaseLock(key: string, lockOwner: string): Promise<boolean> {
  // Lua script to atomically check owner and delete if matches
  const LUA_UNLOCK_SCRIPT = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
  `;
  try {
    // Using eval guarantees atomicity if script isn't loaded yet
    const result = await redis.eval(LUA_UNLOCK_SCRIPT, 1, key, lockOwner);
    // Returns 1 if deleted, 0 if key didn't exist or value didn't match
    const released = result === 1;
    if (released) logger.debug(`${LOG_PREFIX} Lock released for key "${key}" by ${lockOwner}.`);
    else logger.debug(`${LOG_PREFIX} Failed to release lock for key "${key}" (not owner or expired?).`);
    return released;
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error releasing lock for key "${key}":`, error);
    return false;
  }
}


/**
 * [Basic Queue - Pushes a task to the end of a Redis list.
 * @param queueName The name of the list (queue).
 * @param task The task data (will be JSON.stringified).
 * @returns The length of the list after push, or null on error.
 */
export async function redisPushToQueue<T>(queueName: string, task: T): Promise<number | null> {
  try {
    const jsonTask = JSON.stringify(task);
    const length = await redis.rpush(queueName, jsonTask);
    return length;
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error pushing to queue "${queueName}":`, error);
    return null;
  }
}

/**
 * [Basic Queue - Pops a task from the beginning of a Redis list.
 * @param queueName The name of the list (queue).
 * @returns The parsed task data, or null if queue is empty or error occurs.
 */
export async function redisPopFromQueue<T>(queueName: string): Promise<T | null> {
  try {
    const rawTask = await redis.lpop(queueName);
    if (rawTask === null) {
      return null;
    }
    try {
      return JSON.parse(rawTask) as T;
    } catch (parseError) {
      logger.error(`${LOG_PREFIX} Failed to parse JSON from queue "${queueName}". Value: "${rawTask}". Error:`, parseError);
      // Consider pushing back to queue (LPUSH) or moving to a dead-letter queue here?
      return null; // Parsing failed
    }
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error popping from queue "${queueName}":`, error);
    return null;
  }
}