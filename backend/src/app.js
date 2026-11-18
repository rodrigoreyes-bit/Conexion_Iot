import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';
import { env } from './config/env.js';

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    exposedHeaders: ['X-Cache', 'X-Cache-TTL', 'X-Response-Time'],
  })
);
app.use(express.json());
app.use(router);

// JSON mal formado -> 400; cualquier otro error -> 500
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: 'JSON inválido' });
  }
  console.error(err);
  res.status(500).json({ ok: false, error: 'Error interno' });
});
