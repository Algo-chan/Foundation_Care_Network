import Redis from 'ioredis';

interface MemoryStore {
  data: Map<string, { value: string; expiry: number | null }>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<string | null>;
  del(key: string): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  call(...args: string[]): Promise<any>;
}

let memoryStore: MemoryStore | null = null;
let redisClient: Redis | null = null;
let isRedisAvailable = false;
let hasAttemptedConnection = false;

function createMemoryStore(): MemoryStore {
  const data = new Map<string, { value: string; expiry: number | null }>();

  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of data.entries()) {
      if (entry.expiry && now > entry.expiry) {
        data.delete(key);
      }
    }
  };

  setInterval(cleanup, 10000);

  return {
    data,
    async get(key: string): Promise<string | null> {
      cleanup();
      const entry = data.get(key);
      if (!entry) return null;
      if (entry.expiry && Date.now() > entry.expiry) {
        data.delete(key);
        return null;
      }
      return entry.value;
    },
    async set(key: string, value: string, mode?: string, duration?: number): Promise<string | null> {
      const entry = { value, expiry: null as number | null };
      if (mode === 'EX' && duration) {
        entry.expiry = Date.now() + duration * 1000;
      }
      data.set(key, entry);
      return 'OK';
    },
    async del(key: string): Promise<number> {
      const existed = data.has(key);
      data.delete(key);
      return existed ? 1 : 0;
    },
    async incr(key: string): Promise<number> {
      cleanup();
      const entry = data.get(key);
      let val = 0;
      if (entry && entry.expiry === null) {
        val = parseInt(entry.value, 10) || 0;
      }
      val++;
      data.set(key, { value: val.toString(), expiry: entry?.expiry || null });
      return val;
    },
    async expire(key: string, seconds: number): Promise<number> {
      const entry = data.get(key);
      if (!entry) return 0;
      entry.expiry = Date.now() + seconds * 1000;
      return 1;
    },
    async call(...args: string[]): Promise<any> {
      const command = args[0]?.toLowerCase();
      if (command === 'get') return this.get(args[1]);
      if (command === 'set') {
        if (args[3] && args[2]?.toUpperCase() === 'EX') {
          return this.set(args[1], args.slice(3).join(' '), 'EX', parseInt(args[3]));
        }
        return this.set(args[1], args.slice(2).join(' '));
      }
      if (command === 'del') return this.del(args[1]);
      if (command === 'incr') return this.incr(args[1]);
      if (command === 'expire') return this.expire(args[1], parseInt(args[2]));
      return null;
    },
  };
}

function getMemoryStore(): MemoryStore {
  if (!memoryStore) {
    memoryStore = createMemoryStore();
    console.warn('⚠️  Redis not available - using in-memory store (data will be lost on restart)');
  }
  return memoryStore;
}

function createRedisClient(): Redis {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times: number) {
      if (times > 3) {
        isRedisAvailable = false;
        return null;
      }
      return Math.min(times * 200, 1000);
    },
  });

  client.on('error', (err: Error) => {
    if (hasAttemptedConnection) {
      console.warn('Redis connection error:', err.message);
    }
    isRedisAvailable = false;
  });

  client.on('connect', () => {
    console.log('✅ Connected to Redis');
    isRedisAvailable = true;
    hasAttemptedConnection = true;
  });

  client.on('close', () => {
    isRedisAvailable = false;
  });

  return client;
}

export async function checkAndInitRedis(): Promise<boolean> {
  if (!redisClient) {
    redisClient = createRedisClient();
  }

  try {
    await redisClient.ping();
    isRedisAvailable = true;
    hasAttemptedConnection = true;
    return true;
  } catch {
    isRedisAvailable = false;
    hasAttemptedConnection = true;
    return false;
  }
}

export function isRedisWorking(): boolean {
  return isRedisAvailable;
}

export type RedisClientType = Redis | MemoryStore;

function getClient(): RedisClientType {
  if (isRedisAvailable && redisClient) {
    return redisClient;
  }
  return getMemoryStore();
}

const redisWrapper = {
  get: (key: string) => getClient().get(key),
  set: (key: string, value: string, mode?: string, duration?: number) => {
    const client = getClient() as any;
    if (mode && duration !== undefined) {
      return client.set(key, value, mode, duration);
    }
    return client.set(key, value);
  },
  del: (key: string) => getClient().del(key),
  incr: (key: string) => getClient().incr(key),
  expire: (key: string, seconds: number) => getClient().expire(key, seconds),
  call: (...args: string[]) => (getClient() as any).call(...args),
};

export default redisWrapper as unknown as Redis;

checkAndInitRedis().catch(() => {});
