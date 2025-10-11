import IORedis from 'ioredis' // Apparently for bullMQ you need IoRedis
import { Redis as UpstashRedis } from "@upstash/redis"

let redisClient: IORedis;

switch (process.env.NODE_ENV) {
  case 'production':
  case 'development':
    if (!process.env.UPSTASH_REDIS_TCP_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.error("Missing Upstash Redis TCP connection environment variables for production!");
      // Decide how to handle this error - throw, exit, etc.
      throw new Error("Upstash Redis TCP configuration missing for production");
    }
    redisClient = new IORedis(process.env.UPSTASH_REDIS_TCP_URL, {
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        console.warn(`Redis: Retry attempt ${times}, delaying by ${delay}ms`);
        return delay;
      }
    });
    break;
  default:
    redisClient = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      // password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });
    break;
}

redisClient.on('error', (err) => {
  console.error('Redis Connection Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

export const redis = redisClient;

// Upstash Redis for rate limiting
export const upstashRedis = new UpstashRedis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});