import { Router } from 'express';
import { sensorController } from '../controllers/sensorController.js';

export const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, time: new Date() }));

router.post('/sensor-data', sensorController.create);

router.get('/sensor-data/latest', sensorController.latest);
router.get('/sensor-data/history', sensorController.history);
router.get('/devices', sensorController.devices);
router.get('/stats/hourly', sensorController.hourly);
