import { readingRepository } from '../repositories/readingRepository.js';
import { cacheRepository } from '../repositories/cacheRepository.js';
import { env } from '../config/env.js';

const toNumber = (v) => (typeof v === 'string' && v.trim() !== '' ? Number(v.replace(',', '.')) : v);

export function parsePayload(body) {
  const errors = [];
  const deviceId = typeof body?.deviceId === 'string' ? body.deviceId.trim() : '';
  const temperatura = toNumber(body?.temperatura);
  const humedad = toNumber(body?.humedad);
  const nivelAgua = toNumber(body?.nivelAgua);

  if (!deviceId) errors.push('deviceId es obligatorio');
  if (!Number.isFinite(temperatura)) errors.push('temperatura debe ser numérica');
  if (!Number.isFinite(humedad)) errors.push('humedad debe ser numérica');
  if (!Number.isInteger(nivelAgua) || nivelAgua < 0 || nivelAgua > 4)
    errors.push('nivelAgua debe ser entero entre 0 y 4');

  if (errors.length) return { errors };
  return {
    data: {
      deviceId,
      temperatura: Math.round(temperatura * 100) / 100,
      humedad: Math.round(humedad * 100) / 100,
      nivelAgua,
      nivelAguaPct: nivelAgua * 25,
      timestamp: new Date(),
    },
  };
}

export function evaluateAlerts(r) {
  const alerts = [];
  if (r.temperatura > env.alertTempMax)
    alerts.push({ tipo: 'TEMPERATURA_ALTA', mensaje: `Temperatura ${r.temperatura}°C > ${env.alertTempMax}°C` });
  if (r.nivelAgua <= env.alertWaterMin)
    alerts.push({ tipo: 'NIVEL_AGUA_BAJO', mensaje: `Nivel de agua ${r.nivelAguaPct}%` });
  return alerts;
}

export const sensorService = {
  async ingest(data) {
    const saved = await readingRepository.create(data); 
    const reading = { ...saved.toObject(), alerts: evaluateAlerts(saved) };
    await cacheRepository.saveLatest(reading);
    await cacheRepository.publish(reading); 
    return reading;
  },

  async latest(deviceId) {
    const cached = await cacheRepository.getLatest(deviceId);
    if (cached) return cached;
    const [fromDb] = await readingRepository.findLatest(deviceId, 1);
    return fromDb ?? null;
  },

  async history(deviceId) {
    const cached = await cacheRepository.getHistory(deviceId);
    return cached.length ? cached : readingRepository.findLatest(deviceId, 10);
  },

  devices: () => cacheRepository.getDevices(),
  hourly: (deviceId, hours) => readingRepository.hourlyAverage(deviceId, hours),
};
