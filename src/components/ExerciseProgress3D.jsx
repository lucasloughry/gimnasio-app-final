import { useMemo, useState } from 'react';

const WIDTH = 760;
const HEIGHT = 390;
const ORIGIN = { x: 88, y: 315 };

export default function ExerciseProgress3D({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const chart = useMemo(() => {
    const ordered = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const maxReps = Math.max(1, ...ordered.map(item => Number(item.reps) || 0));
    const maxWeight = Math.max(1, ...ordered.map(item => Number(item.weight) || 0));
    const xStep = ordered.length > 1 ? 500 / (ordered.length - 1) : 0;

    const points = ordered.map((item, index) => {
      const depth = (Number(item.weight) || 0) / maxWeight;
      const height = (Number(item.reps) || 0) / maxReps;
      return {
        ...item,
        x: ORIGIN.x + index * xStep + depth * 72,
        y: ORIGIN.y - height * 210 - depth * 48,
        baseX: ORIGIN.x + index * xStep + depth * 72,
        baseY: ORIGIN.y - depth * 48,
      };
    });

    return { ordered, points, maxReps, maxWeight };
  }, [data]);

  if (!chart.points.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 text-center text-sm text-slate-400">
        Elegí un ejercicio con entrenamientos registrados para ver su evolución 3D.
      </div>
    );
  }

  const line = chart.points.map(point => `${point.x},${point.y}`).join(' ');
  const active = activeIndex === null ? chart.points.at(-1) : chart.points[activeIndex];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Vista tridimensional</p>
          <p className="mt-1 text-sm text-slate-400">Tiempo × repeticiones × peso</p>
        </div>
        {active && (
          <div className="flex gap-4 text-right text-sm">
            <div><span className="block text-xs text-slate-500">Reps</span><strong className="text-white">{active.reps}</strong></div>
            <div><span className="block text-xs text-slate-500">Peso</span><strong className="text-emerald-400">{active.weight} kg</strong></div>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="min-w-[680px]" role="img" aria-label="Gráfico 3D de progreso por fecha, repeticiones y peso">
          <defs>
            <linearGradient id="progressLine" x1="0" x2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <radialGradient id="pointGlow">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          {[0, .25, .5, .75, 1].map(level => (
            <g key={level}>
              <line x1={ORIGIN.x} y1={ORIGIN.y - level * 210} x2="660" y2={ORIGIN.y - level * 210} stroke="#1e293b" strokeDasharray="5 7" />
              <text x="72" y={ORIGIN.y - level * 210 + 4} fill="#64748b" fontSize="11" textAnchor="end">{Math.round(chart.maxReps * level)}</text>
            </g>
          ))}
          {[0, .5, 1].map(level => (
            <g key={level}>
              <line x1={ORIGIN.x + level * 72} y1={ORIGIN.y - level * 48} x2={660 + level * 72} y2={ORIGIN.y - level * 48} stroke="#1e293b" />
              <text x={675 + level * 72} y={ORIGIN.y - level * 48 + 4} fill="#64748b" fontSize="11">{Math.round(chart.maxWeight * level)}kg</text>
            </g>
          ))}

          <line x1={ORIGIN.x} y1={ORIGIN.y} x2="660" y2={ORIGIN.y} stroke="#475569" strokeWidth="2" />
          <line x1={ORIGIN.x} y1={ORIGIN.y} x2={ORIGIN.x} y2="82" stroke="#475569" strokeWidth="2" />
          <line x1="660" y1={ORIGIN.y} x2="732" y2="267" stroke="#475569" strokeWidth="2" />
          <text x="27" y="190" fill="#94a3b8" fontSize="12" transform="rotate(-90 27 190)">REPETICIONES</text>
          <text x="354" y="365" fill="#94a3b8" fontSize="12">TIEMPO</text>
          <text x="680" y="248" fill="#94a3b8" fontSize="12" transform="rotate(-32 680 248)">PESO</text>

          {chart.points.map((point, index) => (
            <g key={`${point.date}-${index}`}>
              <line x1={point.baseX} y1={point.baseY} x2={point.x} y2={point.y} stroke="#334155" strokeDasharray="3 5" />
              <text x={point.baseX} y="340" fill="#64748b" fontSize="10" textAnchor="middle">{new Date(point.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</text>
            </g>
          ))}
          <polyline points={line} fill="none" stroke="url(#progressLine)" strokeWidth="4" strokeLinejoin="round" filter="url(#glow)" />
          {chart.points.map((point, index) => (
            <circle key={`${point.date}-point-${index}`} cx={point.x} cy={point.y} r={activeIndex === index ? 9 : 6} fill="url(#pointGlow)" stroke="#ecfeff" strokeWidth="2" className="cursor-pointer transition-all" onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)} onFocus={() => setActiveIndex(index)} tabIndex="0">
              <title>{`${new Date(point.date).toLocaleDateString('es-AR')}: ${point.reps} reps, ${point.weight} kg`}</title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}
