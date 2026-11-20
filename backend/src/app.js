import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';
import { env } from './config/env.js';

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(router);

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: 'JSON inválido' });
  }
  console.error(err);
  res.status(500).json({ ok: false, error: 'Error interno' });
});
