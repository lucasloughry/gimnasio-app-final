import { Link } from 'react-router-dom';

const TRAINING_DAYS = [1, 2, 4, 5];

export default function TodayWorkout({ templates = [], isLoading = false }) {
  const slot = TRAINING_DAYS.indexOf(new Date().getDay());
  const template = slot >= 0 && templates.length ? templates[slot % templates.length] : null;
  if (isLoading) return <div className="mb-8 h-52 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />;
  if (!template) return <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">Plan de hoy</p><h2 className="mt-2 text-2xl font-black">Día de recuperación</h2><p className="mt-2 text-slate-500">Movilidad, caminata suave y descanso. Tu próximo entrenamiento ya está esperándote.</p></section>;

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-emerald-300 bg-slate-950 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Hoy toca</p><h2 className="mt-2 text-3xl font-black">{template.category}</h2><p className="mt-1 text-slate-400">{template.name}</p></div><Link to={`/log-workout?template=${template._id}`} className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300">Empezar rutina →</Link></div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">{template.exercises.slice(0, 6).map((exercise, index) => <span key={`${exercise.name}-${index}`} className="whitespace-nowrap rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">{index + 1}. {exercise.name}</span>)}</div>
    </section>
  );
}
