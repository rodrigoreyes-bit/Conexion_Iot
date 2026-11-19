import { useEffect, useState } from 'react';
import { api, socket } from './services/api.js';

import SensorCard from './components/SensorCard.jsx';
import HistoryTable from './components/HistoryTable.jsx';
import AlertList from './components/AlertList.jsx';
import RealtimeChart from './components/RealtimeChart.jsx';
import HourlyAverage from './components/HourlyAverage.jsx';



export default function App() {
const [latest, setLatest] = useState(null);
const [history, setHistory] = useState([]);
const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Carga inicial por HTTP
    api.latest().then(setLatest).catch(console.error);
    api.history().then(setHistory).catch(console.error);

    // Tiempo real por WebSocket
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onNewReading = (reading) => {
      setLatest(reading);

      setHistory((prev) =>
        [reading, ...prev].slice(0, 10)
      );
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new-reading', onNewReading);

    socket.connect();
    setConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new-reading', onNewReading);
      socket.disconnect();
    };
  }, []);


// Obtener la lectura anterior para calcular tendencias
const previousReading = history.length >= 2 ? history[1] : null;

  return (
    <main className="container">
      <header>
        <h1>Conexión IoT</h1>

        <span className={`status ${connected ? 'ok' : 'off'}`}>
          {connected ? 'En vivo' : 'Desconectado'}
        </span>
      </header>

      {latest ? (
        <>
          <section className="cards">
            <SensorCard
              label="Temperatura"
              value={latest.temperatura}
              previousValue={previousReading?.temperatura}
              unit="°C"
            />

            <SensorCard
              label="Humedad"
              value={latest.humedad}
              previousValue={previousReading?.humedad}
              unit="%"
            />

            <SensorCard
              label="Nivel de agua"
              value={latest.nivelAguaPct}
              previousValue={previousReading?.nivelAguaPct}
              unit="%"
            />
          </section>

          <AlertList alerts={latest.alerts ?? []} reading={latest} />
        </>
      ) : (
        <p>Esperando datos del sensor…</p>
      )}

      {<RealtimeChart history={history} />}

      <HourlyAverage history={history} />

      <HistoryTable rows={history} />
    </main>
  );
}
