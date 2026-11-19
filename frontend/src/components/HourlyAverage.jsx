import { Thermometer } from './SensorCard.jsx';

export default function HourlyAverage({ history }) {
  const grupos = {};

  // Agrupar las lecturas por fecha y hora
  history.forEach((lectura) => {
    const fecha = new Date(lectura.timestamp);
    const temperatura = Number(lectura.temperatura);

    if (
      Number.isNaN(fecha.getTime()) ||
      !Number.isFinite(temperatura)
    ) return;

    const clave = [
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      fecha.getHours()
    ].join('-');

    if (!grupos[clave]) {
      grupos[clave] = {
        hora: fecha.toLocaleString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          hour12: false
        }) + ':00',
        suma: 0,
        cantidad: 0
      };
    }

    grupos[clave].suma += temperatura;
    grupos[clave].cantidad++;
  });

  const promedios = Object.values(grupos).map((grupo) => ({
    hora: grupo.hora,
    promedio: (grupo.suma / grupo.cantidad).toFixed(2),
    cantidad: grupo.cantidad
  }));

  return (
    <section className="hourly-section">
      <h2>Promedio de temperatura por hora</h2>

      <div className="hourly-grid">
        {promedios.length === 0 ? (
          <p>No hay datos disponibles.</p>
        ) : (
          promedios.map((grupo) => (
          <div className="hourly-card" key={grupo.hora}>

            <div className="hourly-info">
              <span className="hourly-label">
                {grupo.hora}
              </span>

              <span className="hourly-value">
                {grupo.promedio} °C
              </span>

              <span className="hourly-count">
                {grupo.cantidad} lecturas
              </span>
            </div>

            <div className="hourly-thermometer">
              <Thermometer value={grupo.promedio} />
            </div>

          </div>
        ))
        )}
      </div>
    </section>
  );
}
