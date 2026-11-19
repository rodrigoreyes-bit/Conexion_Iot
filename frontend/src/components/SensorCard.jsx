
export function Thermometer({ value }) {
  const temperature = Number(value);

  const color =
    temperature < 18 ? '#38bdf8' :
    temperature < 28 ? '#22c55e' :
    temperature < 35 ? '#facc15' : '#ef4444';

  const level = Math.max(0, Math.min(100, (temperature / 45) * 100));

  return (
    <svg width="70" height="110" viewBox="0 0 70 110">
      <rect x="25" y="5" width="20" height="75" rx="10"
        fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />

      <rect
        x="31"
        y={72 - level * 0.55}
        width="8"
        height={level * 0.55 + 10}
        rx="4"
        fill={color}
        style={{ transition: 'all 0.5s ease' }}
      />

      <circle cx="35" cy="82" r="18"
        fill={color} stroke="#64748b" strokeWidth="2"
        style={{ transition: 'fill 0.5s ease' }}
      />

      <circle cx="35" cy="82" r="8" fill="#ffffff55" />
    </svg>
  );
}

function Plant({ value }) {
  const humidity = Number(value);

  const dry = humidity < 30;
  const healthy = humidity >= 30 && humidity <= 70;

  const leafColor = dry
    ? '#ca8a04'
    : healthy
      ? '#22c55e'
      : '#15803d';

  return (
    <svg width="90" height="110" viewBox="0 0 90 110">
      <path d="M25 78 H65 L60 105 H30 Z" fill="#c08457" />
      <path d="M45 80 V30"
        stroke="#4d7c0f" strokeWidth="4"
        strokeLinecap="round" />

      <ellipse cx="30" cy={dry ? 65 : 52}
        rx="17" ry="9"
        transform={`rotate(30 30 ${dry ? 65 : 52})`}
        fill={leafColor}
        style={{ transition: 'all 0.5s ease' }}
      />

      <ellipse cx="60" cy={dry ? 65 : 45}
        rx="17" ry="9"
        transform={`rotate(-30 60 ${dry ? 65 : 45})`}
        fill={leafColor}
        style={{ transition: 'all 0.5s ease' }}
      />

      {!dry && (
        <ellipse cx="45" cy="25"
          rx={healthy ? 12 : 17}
          ry={healthy ? 17 : 22}
          fill={leafColor}
        />
      )}
    </svg>
  );
}

function WaterDrop({ value }) {
  const water = Math.max(0, Math.min(100, Number(value)));
  const fillHeight = water * 0.9;

  return (
    <svg width="80" height="110" viewBox="0 0 80 110">
      <defs>
        <clipPath id="water-drop-clip">
          <path d="
            M40 5
            C30 25 10 50 10 72
            A30 30 0 0 0 70 72
            C70 50 50 25 40 5
            Z
          " />
        </clipPath>
      </defs>

      <path
        d="M40 5 C30 25 10 50 10 72
           A30 30 0 0 0 70 72
           C70 50 50 25 40 5 Z"
        fill="#dbeafe"
        stroke="#0284c7"
        strokeWidth="2"
      />

      <g clipPath="url(#water-drop-clip)">
        <rect
          x="0"
          y={105 - fillHeight}
          width="80"
          height={fillHeight}
          fill="#38bdf8"
          style={{ transition: 'all 0.5s ease' }}
        />
      </g>
    </svg>
  );
}

export default function SensorCard({
  label,
  value,
  previousValue,
  unit
}) {
  const numericValue = Number(value);
  const hasValue = value !== null &&
    value !== undefined &&
    Number.isFinite(numericValue);

  let illustration = null;
  let status = '';

  if (hasValue && label === 'Temperatura') {
    illustration = <Thermometer value={numericValue} />;
    status =
      numericValue < 18 ? 'Frío' :
      numericValue < 28 ? 'Normal' :
      numericValue < 35 ? 'Elevada' : 'Alta';
  }

  if (hasValue && label === 'Humedad') {
    illustration = <Plant value={numericValue} />;
    status =
      numericValue < 30 ? 'Baja' :
      numericValue <= 70 ? 'Normal' : 'Alta';
  }

  if (hasValue && label === 'Nivel de agua') {
    illustration = <WaterDrop value={numericValue} />;
    status =
      numericValue < 25 ? 'Nivel bajo' :
      numericValue < 70 ? 'Nivel medio' : 'Nivel alto';
  }

  // Calcular la tendencia del sensor
  let trend = 'Sin datos previos';
  let trendSymbol = '•';
  let trendClass = 'stable';

  const previousIsValid =
    previousValue !== null &&
    previousValue !== undefined &&
    Number.isFinite(Number(previousValue));

  if (hasValue && previousIsValid) {
    const difference = numericValue - Number(previousValue);

    // Tolerancia para evitar cambios insignificantes
    const tolerance = label === 'Temperatura' ? 0.5 : 2;

    if (difference > tolerance) {
      trend = 'Subiendo';
      trendSymbol = '↗';
      trendClass = 'up';
    } else if (difference < -tolerance) {
      trend = 'Bajando';
      trendSymbol = '↘';
      trendClass = 'down';
    } else {
      trend = 'Estable';
      trendSymbol = '→';
      trendClass = 'stable';
    }
}

  return (
    <div className="card sensor-card">
      <div className="sensor-info">
        <span className="card-label">{label}</span>

        <span className="card-value">
          {hasValue ? value : '—'}
          <small>{unit}</small>
        </span>
        
        {hasValue && (
          <span className="sensor-status">{status}</span>
        )}
      </div>

        {hasValue && (
        <span className={`sensor-trend ${trendClass}`}>
          <span className="trend-arrow">{trendSymbol}</span>
          {trend}
        </span>
        )}

      <div className="sensor-illustration">
        {illustration}
      </div>
    </div>
  );
}
