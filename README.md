# Conexión_Iot

Taller 5 – Bases de datos no relacionales. Un ESP32 envía cada 10 s una lectura JSON al backend, que la guarda en **MongoDB** (histórico) y en **Redis** (caché clave-valor + tiempo real). Un dashboard en React muestra los datos en vivo por WebSocket.

```
ESP32 / simulador ──POST /sensor-data──► Backend (Express)
                                          ├─► MongoDB  (histórico, agregaciones)
                                          └─► Redis    (última lectura, últimos 10, pub/sub)
                                                  │
                     Frontend (React) ◄──WebSocket┘
```

## Estructura

```
backend/     API Node.js + Express + Socket.IO
  src/config/        conexión a Mongo, Redis y variables de entorno
  src/routes/        definición de endpoints
  src/controllers/   capa HTTP (req/res)
  src/services/      lógica de negocio (validación, alertas)
  src/repositories/  acceso a datos (Mongo y Redis)
  src/models/        esquemas de Mongoose
  src/realtime/      WebSocket (Redis pub/sub -> Socket.IO)
frontend/    React + Vite (dashboard)
simulator/   script que imita al ESP32
docs/        contrato de la API y diagramas de arquitectura
```

## Cómo levantar en local

Requisitos: Node 20+ y Docker.

1. Bases de datos:
   ```bash
   docker compose up -d
   ```
2. Backend:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```
3. Frontend (otra terminal):
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   Abrir http://localhost:5173
4. Simulador (otra terminal):
   ```bash
   node simulator/simulator.js http://localhost:3000 2000
   ```

## Reparto de trabajo

| Integrante | Área | Archivos principales |
|---|---|---|
| 1 | Backend + MongoDB | `backend/src/models`, `repositories/readingRepository.js`, agregaciones (`/stats/*`) |
| 2 | Redis + tiempo real | `repositories/cacheRepository.js`, `realtime/`, alertas |
| 3 | Frontend | `frontend/src` (gráfico en vivo, indicadores, alertas) |
| 4 | DevOps + arquitectura + QA | `docker-compose.yml`, `simulator/`, deploy, `docs/` |

## Flujo de trabajo (Git)

- `main` protegida: solo entra código por Pull Request con 1 revisión.
- Una rama por tarea: `feat/hourly-average`, `feat/realtime-chart`, `fix/...`
- Commits cortos y descriptivos: `feat: agrega promedio por hora`.
- El contrato de la API está en [docs/api.md](docs/api.md); si cambian un endpoint, actualícenlo ahí.

## Arquitectura del sistema

El proyecto cuenta con dos diagramas que describen su funcionamiento y organización interna:

### Arquitectura del sistema

Representa la comunicación entre el ESP32 o simulador, el backend, las bases de datos y el dashboard web.

[Ver diagrama de arquitectura del sistema](docs/arquitectura-sistema.md)

### Arquitectura del software

Representa la organización interna del código, incluyendo las capas del backend y los componentes del frontend.

[Ver diagrama de arquitectura del software](docs/arquitectura-software.md)