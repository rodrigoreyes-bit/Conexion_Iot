import { redis } from '../config/redis.js';

const HISTORY_SIZE = 10;
export const CHANNEL = 'sensor:new-reading';

export const cacheRepository = {
  async saveLatest(reading) {
    const json = JSON.stringify(reading);
    await redis
      .multi()
      .set(`latest:${reading.deviceId}`, json)
      .lpush(`history:${reading.deviceId}`, json)
      .ltrim(`history:${reading.deviceId}`, 0, HISTORY_SIZE - 1)
      .sadd('devices', reading.deviceId)
      .exec();
  },

  async getLatest(deviceId) {
    const raw = await redis.get(`latest:${deviceId}`);
    return raw ? JSON.parse(raw) : null;
  },

  async getHistory(deviceId) {
    const items = await redis.lrange(`history:${deviceId}`, 0, HISTORY_SIZE - 1);
    return items.map((i) => JSON.parse(i));
  },

  getDevices: () => redis.smembers('devices'),

  publish: (reading) => redis.publish(CHANNEL, JSON.stringify(reading)),

};
