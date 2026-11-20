import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.redisUrl);
export const redisSub = new Redis(env.redisUrl);

redis.on('connect', () => console.log('[redis] conectado'));
redis.on('error', (err) => console.error('[redis] error:', err.message));
redisSub.on('error', (err) => console.error('[redis-sub] error:', err.message));
