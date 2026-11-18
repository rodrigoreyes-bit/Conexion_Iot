# Contrato de la API

Base URL local: `http://localhost:3000`

## POST /sensor-data (obligatorio)

Recibe la lectura del ESP32. Acepta `temperatura` y `humedad` como número o string numérico.

```json
{
  "deviceId": "esp32_1",
  "temperatura": 24.57,
  "humedad": 61.20,
  "nivelAgua": 3
}
```

`nivelAgua`: entero 0–4 (0 = 0%, 1 = 25%, 2 = 50%, 3 = 75%, 4 = 100%).

Respuestas:
- `201` → `{ "ok": true, "reading": { ...lectura, "nivelAguaPct": 75, "timestamp": "...", "alerts": [] } }`
- `400` → `{ "ok": false, "errors": ["temperatura debe ser numérica"] }`

## GET /sensor-data/latest?deviceId=esp32_1

Última lectura (desde Redis; si no está, desde Mongo).

## GET /sensor-data/history?deviceId=esp32_1

Últimas 10 lecturas, de la más nueva a la más antigua.

## GET /devices

Lista de `deviceId` que han enviado datos.

## GET /stats/hourly?deviceId=esp32_1

Promedio por hora. **Cálculo pendiente (Integrante 1).** Formato propuesto:

```json
[{ "hora": "2026-11-14T15:00:00.000Z", "temperatura": 24.1, "humedad": 58.3, "n": 360 }]
```

La respuesta se cachea en Redis (`cache:hourly:{deviceId}`) durante `CACHE_TTL_SECONDS` (60 por defecto). Headers de la respuesta:

| Header | Valor |
|---|---|
| `X-Cache` | `HIT` si vino de Redis, `MISS` si se calculó en Mongo |
| `X-Cache-TTL` | segundos que le quedan a la caché |
| `X-Response-Time` | tiempo que tardó el servidor, p. ej. `0.85ms` |

## GET /stats/summary?deviceId=esp32_1

Contadores guardados en Redis.

```json
{
  "totalLecturas": 1520,
  "lecturasDispositivo": 1520,
  "alertas": { "TEMPERATURA_ALTA": 12, "NIVEL_AGUA_BAJO": 40 }
}
```

## GET /health

`{ "ok": true, "time": "..." }`

## WebSocket (Socket.IO)

| Evento | Dirección | Payload |
|---|---|---|
| `new-reading` | servidor → cliente | misma lectura que devuelve el POST |

## Alertas

Se calculan en el backend y llegan en `reading.alerts`:
- `TEMPERATURA_ALTA`: temperatura > `ALERT_TEMP_MAX` (por defecto 30)
- `NIVEL_AGUA_BAJO`: nivelAgua <= `ALERT_WATER_MIN` (por defecto 1, o sea 25%)

## Claves en Redis

| Clave | Tipo | Uso |
|---|---|---|
| `latest:{deviceId}` | string (JSON) | última lectura |
| `history:{deviceId}` | list (máx. 10) | últimos 10 datos |
| `devices` | set | dispositivos conocidos |
| `sensor:new-reading` | canal pub/sub | avisa al WebSocket |
| `stats:readings:total` | string (INCR) | total global de lecturas |
| `stats:device:{deviceId}` | hash (HINCRBY) | `lecturas` y cantidad de cada tipo de alerta |
| `cache:hourly:{deviceId}` | string (JSON) con TTL | caché del promedio por hora |
