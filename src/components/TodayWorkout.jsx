import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const DAYS = [
  { value: 1, label: 'Lunes' }, { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' }, { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' }, { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export default function TodayWorkout({ templates = [], plan = [], isLoading = false, onSavePlan }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(plan);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(plan), [plan]);

  const today = new Date().getDay();
  const todayAssignment = plan.find(item => Number(item.day) === today);
  const todayTemplate = templates.find(template => template._id === (todayAssignment?.template?._id || todayAssignment?.template));

  const toggleDay = day => {
    setDraft(current => current.some(item => Number(item.day) === day)
      ? current.filter(item => Number(item.day) !== day)
      : [...current, { day, template: templates[0]?._id || '' }]);
  };
  const setRoutine = (day, template) => setDraft(current => current.map(item => Number(item.day) === day ? { day, template } : item));
  const save = async () => {
    setSaving(true);
    const saved = await onSavePlan(draft);
    setSaving(false);
    if (saved) setEditing(false);
  };

  if (isLoading) return <div className="mb-8 h-52 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />;

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">Plan de hoy</p>
            {todayTemplate ? <><h2 className="mt-2 text-3xl font-black">{todayTemplate.category}</h2><p className="mt-1 text-slate-500">Rutina: {todayTemplate.name}</p></> : <><h2 className="mt-2 text-2xl font-black">{plan.length ? 'Día de recuperación' : 'Configurá tu semana'}</h2><p className="mt-2 text-slate-500">{plan.length ? 'Hoy no tenés una rutina programada.' : 'Elegí cuántos días entrenás y qué rutina corresponde a cada uno.'}</p></>}
          </div>
          <div className="flex gap-2">
            <button disabled={!templates.length} onClick={() => setEditing(current => !current)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-700">{editing ? 'Cancelar' : 'Configurar semana'}</button>
            {todayTemplate && <Link to={`/log-workout?template=${todayTemplate._id}`} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">Empezar →</Link>}
          </div>
        </div>

        {todayTemplate && <div className="mt-5 flex gap-2 overflow-x-auto pb-1">{todayTemplate.exercises.slice(0, 6).map((exercise, index) => <span key={`${exercise.name}-${index}`} className="whitespace-nowrap rounded-full bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800">{index + 1}. {exercise.name}</span>)}</div>}

        {editing && (
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
            <h3 className="font-black">¿Qué días vas a entrenar?</h3>
            <p className="mt-1 text-sm text-slate-500">Seleccioná un día y asignale una de tus rutinas.</p>
            <div className="mt-4 space-y-3">
              {DAYS.map(day => {
                const assignment = draft.find(item => Number(item.day) === day.value);
                return <div key={day.value} className={`grid gap-3 rounded-2xl border p-3 sm:grid-cols-[150px_1fr] ${assignment ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700'}`}><label className="flex cursor-pointer items-center gap-3 font-bold"><input type="checkbox" checked={Boolean(assignment)} onChange={() => toggleDay(day.value)} className="h-5 w-5 accent-emerald-500" />{day.label}</label>{assignment && <select value={assignment.template?._id || assignment.template} onChange={event => setRoutine(day.value, event.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700">{templates.map(template => <option key={template._id} value={template._id}>{template.name} · {template.category}</option>)}</select>}</div>;
              })}
            </div>
            <button disabled={saving || !draft.length} onClick={save} className="mt-5 w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-40 dark:bg-emerald-400 dark:text-slate-950">{saving ? 'Guardando…' : `Guardar plan de ${draft.length} días`}</button>
          </div>
        )}
      </div>
    </section>
  );
}
