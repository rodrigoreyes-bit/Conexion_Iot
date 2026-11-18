import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/conexion_iot',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  alertTempMax: Number(process.env.ALERT_TEMP_MAX) || 30,
  alertWaterMin: Number(process.env.ALERT_WATER_MIN ?? 1),
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 60,
};
