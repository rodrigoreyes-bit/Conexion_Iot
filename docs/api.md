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

## GET /stats/hourly?deviceId=esp32_1&hours=24

Promedio por hora de las últimas `hours` horas (por defecto 24, máximo 720), calculado en MongoDB con un aggregation pipeline. Ordenado de la hora más antigua a la más nueva; `n` = lecturas en esa hora.

```json
[{ "hora": "2026-11-14T15:00:00.000Z", "temperatura": 24.1, "humedad": 58.3, "nivelAguaPct": 75, "n": 360 }]
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
