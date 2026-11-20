import { Reading } from '../models/Reading.js';

export const readingRepository = {
  create: (data) => Reading.create(data),

  findLatest: (deviceId, limit = 10) =>
    Reading.find({ deviceId }).sort({ timestamp: -1 }).limit(limit).lean(),

  devices: () => Reading.distinct('deviceId'),

  hourlyAverage: (deviceId, hours = 24) =>
    Reading.aggregate([
      { $match: { deviceId, timestamp: { $gte: new Date(Date.now() - hours * 3600_000) } } },
      {
        $group: {
          _id: { $dateTrunc: { date: '$timestamp', unit: 'hour' } },
          temperatura: { $avg: '$temperatura' },
          humedad: { $avg: '$humedad' },
          nivelAguaPct: { $avg: '$nivelAguaPct' },
          n: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          hora: '$_id',
          temperatura: { $round: ['$temperatura', 2] },
          humedad: { $round: ['$humedad', 2] },
          nivelAguaPct: { $round: ['$nivelAguaPct', 0] },
          n: 1,
        },
      },
    ]),
};
