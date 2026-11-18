import { redis } from '../config/redis.js';

const HISTORY_SIZE = 10;
export const CHANNEL = 'sensor:new-reading';

// Capa de acceso a Redis (clave-valor)
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

  // ---------- Contadores ----------
  // stats:readings:total      -> string con el total global de lecturas (INCR)
  // stats:device:{deviceId}   -> hash { lecturas, TEMPERATURA_ALTA, NIVEL_AGUA_BAJO, ... } (HINCRBY)
  async incrementCounters(reading) {
    const key = `stats:device:${reading.deviceId}`;
    const multi = redis.multi().incr('stats:readings:total').hincrby(key, 'lecturas', 1);
    for (const alert of reading.alerts ?? []) multi.hincrby(key, alert.tipo, 1);
    await multi.exec();
  },

  async getCounters(deviceId) {
    const [total, hash] = await Promise.all([
      redis.get('stats:readings:total'),
      redis.hgetall(`stats:device:${deviceId}`),
    ]);
    const { lecturas = 0, ...alertas } = hash;
    return {
      totalLecturas: Number(total) || 0,
      lecturasDispositivo: Number(lecturas) || 0,
      alertas: Object.fromEntries(Object.entries(alertas).map(([k, v]) => [k, Number(v)])),
    };
  },

  // ---------- Caché con TTL (patrón cache-aside) ----------
  // Busca la clave en Redis; si no está, ejecuta fetchFn (p. ej. una consulta a Mongo),
  // guarda el resultado con expiración (EX) y lo devuelve.
  // Si Redis falla, responde igual con los datos de fetchFn (la caché nunca rompe la API).
  async getOrSet(key, ttlSeconds, fetchFn) {
    try {
      const cached = await redis.get(key);
      if (cached !== null) {
        return { data: JSON.parse(cached), fromCache: true, ttl: await redis.ttl(key) };
      }
    } catch (err) {
      console.error('[cache] error leyendo', key, err.message);
    }

    const data = await fetchFn();
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (err) {
      console.error('[cache] error guardando', key, err.message);
    }
    return { data, fromCache: false, ttl: ttlSeconds };
  },

  // TODO (Integrante 2): estado de alertas (notificar solo cuando cambian)
};
