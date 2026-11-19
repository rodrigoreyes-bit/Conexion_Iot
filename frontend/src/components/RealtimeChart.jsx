
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function RealtimeChart({ history }) {

  // Ordenamos las lecturas desde la más antigua
  // hasta la más reciente.
  const datos = [...history].reverse().map((lectura) => ({
    hora: new Date(lectura.timestamp).toLocaleTimeString(),
    temperatura: lectura.temperatura,
    humedad: lectura.humedad,
    agua: lectura.nivelAguaPct
  }));

  return (
    <section className="chart-section">
      <h2>Gráfico en tiempo real</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="hora" />
            <YAxis domain={[0, 100]} />

            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="temperatura"
              stroke="#ef449a"
              strokeWidth={3}
              name="Temperatura (°C)"
              dot={{ r: 4 }}
            />

            <Line
              type="monotone"
              dataKey="humedad"
              stroke="#22c55e"
              strokeWidth={3}
              name="Humedad (%)"
              dot={{ r: 4 }}
            />

            <Line
              type="monotone"
              dataKey="agua"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Nivel de agua (%)"
              dot={{ r: 4 }}
            />

          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
