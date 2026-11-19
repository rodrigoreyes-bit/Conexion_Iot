
const TEMP_MAX = 30;
const AGUA_MIN = 20;

export default function AlertList({ alerts = [], reading = null }) {
  // Conservamos las alertas que envía el backend
  const alertas = [...alerts];

  // Generamos alertas visuales a partir de los sensores
  if (reading) {
    if (
      reading.temperatura > TEMP_MAX &&
      !alertas.some(a => a.tipo === 'temperatura_alta')
    ) {
      alertas.push({
        tipo: 'temperatura_alta',
        mensaje: `🌡️ Temperatura elevada: ${reading.temperatura} °C`
      });
    }

    if (
      reading.nivelAguaPct < AGUA_MIN &&
      !alertas.some(a => a.tipo === 'agua_baja')
    ) {
      alertas.push({
        tipo: 'agua_baja',
        mensaje: `💧 Nivel de agua bajo: ${reading.nivelAguaPct}%`
      });
    }
  }

  if (!alertas.length) {
    return <div className="alert ok">Todo en orden</div>;
  }

  return (
    <div>
      {alertas.map((a, index) => (
        <div key={`${a.tipo}-${index}`} className="alert danger">
          {a.mensaje}
        </div>
      ))}
    </div>
  );
}
