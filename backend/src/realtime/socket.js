import { Server } from 'socket.io';
import { redisSub } from '../config/redis.js';
import { CHANNEL } from '../repositories/cacheRepository.js';
import { env } from '../config/env.js';

export function setupSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: env.corsOrigin } });

  io.on('connection', (socket) => {
    console.log('[ws] cliente conectado', socket.id);
  });

  redisSub.subscribe(CHANNEL);
  redisSub.on('message', (_channel, message) => {
    io.emit('new-reading', JSON.parse(message));
  });

  return io;
}
