import { registerAs } from '@nestjs/config';

export const performanceConfig = registerAs('performance', () => ({
  steam: {
    pageSize: parseInt(process.env.STEAM_PAGE_SIZE || '100', 10),
    rateLimit: {
      ttl: parseInt(process.env.STEAM_RATE_LIMIT_TTL || '60000', 10), // 1 minute
      limit: parseInt(process.env.STEAM_RATE_LIMIT_REQUESTS || '100', 10), // 100 requests per minute
    },
    backoff: {
      initialDelay: parseInt(
        process.env.STEAM_BACKOFF_INITIAL_DELAY || '1000',
        10,
      ), // 1 second
      maxDelay: parseInt(process.env.STEAM_BACKOFF_MAX_DELAY || '30000', 10), // 30 seconds
      maxAttempts: parseInt(process.env.STEAM_BACKOFF_MAX_ATTEMPTS || '3', 10),
    },
  },
  database: {
    batchSize: parseInt(process.env.DB_BATCH_SIZE || '100', 10),
  },
}));
