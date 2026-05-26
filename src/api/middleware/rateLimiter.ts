import rateLimit from 'express-rate-limit';
import redis, { isRedisWorking } from '../utils/redis';

function createRateLimiter(options: {
  windowMs: number;
  max: number;
  prefix: string;
  skip?: (req: any) => boolean;
  message?: any;
}) {
  const { windowMs, max, prefix, skip, message } = options;
  const baseConfig = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    message,
    keyGenerator: (req: any) => `${prefix}:${req.ip}`,
    validate: false,
  };

  if (isRedisWorking()) {
    try {
      const { RedisStore } = require('rate-limit-redis');
      return rateLimit({
        ...baseConfig,
        store: new RedisStore({
          sendCommand: (...args: unknown[]) => (redis as any).call(...(args as string[])),
        }),
      });
    } catch {
      // Fall through to memory store
    }
  }

  return rateLimit(baseConfig);
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  prefix: 'auth',
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts, please try again after 15 minutes',
      status: 429,
    },
  },
});

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  prefix: 'general',
  skip: (req) => req.path.startsWith('/v1/auth'),
});
