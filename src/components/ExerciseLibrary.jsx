import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATALOG, EQUIPMENT, normalizeName } from '../workoutData';
import { MUSCLE_GROUPS } from '../training';
import ExerciseDemo from './ExerciseDemo';

export default function ExerciseLibrary() {
  const [group,setGroup]=useState('Pecho');
  const [search,setSearch]=useState('');
  const exercises=CATALOG.filter(ex=>(!group||ex.group===group)&&normalizeName(ex.name).includes(normalizeName(search)));
  return <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">{CATALOG.length} ejercicios</p><h2 className="mt-1 text-2xl font-black">Explorá por grupo muscular</h2></div><input aria-label="Buscar en catálogo" value={search} onChange={e=>{setSearch(e.target.value);if(e.target.value)setGroup('');}} placeholder="Buscar ejercicio…" className="w-full rounded-xl border p-3 sm:w-64"/></div>
    <div className="my-4 flex flex-wrap gap-2">{['',...MUSCLE_GROUPS].map(g=><button key={g} type="button" aria-pressed={group===g} onClick={()=>setGroup(g)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${group===g?'border-emerald-400 bg-emerald-400 text-slate-950':'border-slate-200 dark:border-slate-700'}`}>{g||'Todos'}</button>)}</div>
    <div className="grid max-h-[36rem] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">{exercises.map(ex=><article key={ex.name} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><p className="text-xs text-emerald-600">{ex.group}{ex.unilateral?' · por lado':''}</p><h3 className="mt-1 font-bold">{ex.name}</h3><p className="mt-1 text-xs text-slate-500">{EQUIPMENT[ex.equipment]}</p><ExerciseDemo name={ex.name}/><Link to={`/log-workout?exercise=${encodeURIComponent(ex.name)}`} className="mt-2 inline-block text-sm font-bold text-emerald-700 dark:text-emerald-400">Registrar este ejercicio →</Link></article>)}</div>
    {!exercises.length&&<p className="py-6 text-sm text-slate-500">No hay ejercicios con ese nombre en este grupo.</p>}
  </section>;
}
