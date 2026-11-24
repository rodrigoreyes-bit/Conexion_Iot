import { Server } from 'socket.io';
import { redisSub } from '../config/redis.js';
import { CHANNEL } from '../repositories/cacheRepository.js';
import { env } from '../config/env.js';

// Escucha el canal de Redis y reenvía cada lectura a los navegadores conectados
export function setupSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: env.corsOrigin } });

  io.on('connection', (socket) => {
    console.log('[ws] cliente conectado', socket.id);
  });

  const subscribe = () =>
    redisSub.subscribe(CHANNEL).catch((err) => console.error('[redis-sub] error al suscribir:', err.message));
  if (redisSub.status === 'ready') subscribe();
  else redisSub.once('ready', subscribe);

  redisSub.on('message', (_channel, message) => {
    io.emit('new-reading', JSON.parse(message));
  });

  return io;
}
