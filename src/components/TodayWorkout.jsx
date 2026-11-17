import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MUSCLE_GROUPS, recommendExercises } from '../training';
import { CATALOG, normalizeName } from '../workoutData';

const DAYS = [{value:1,label:'Lunes'},{value:2,label:'Martes'},{value:3,label:'Miércoles'},{value:4,label:'Jueves'},{value:5,label:'Viernes'},{value:6,label:'Sábado'},{value:0,label:'Domingo'}];
const DEFAULT_DAYS = [1,2,4,5,3,6,0];
const field = 'rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900';

export default function TodayWorkout({templates=[],plan=[],isLoading=false,onSavePlan}) {
  const [editing,setEditing] = useState(false);
  const groupPlan=useMemo(()=>plan.map(item=>{
    if(item.groups?.length)return {day:item.day,groups:item.groups};
    const template=templates.find(t=>t._id===(item.template?._id||item.template));
    const groups=[...new Set((template?.exercises||[]).map(ex=>CATALOG.find(meta=>normalizeName(meta.name)===normalizeName(ex.name))?.group).filter(Boolean))];
    if(!groups.length && template?.category)groups.push(...MUSCLE_GROUPS.filter(g=>normalizeName(template.category).includes(normalizeName(g))));
    return {day:item.day,groups};
  }),[plan,templates]);
  const [draft,setDraft] = useState(groupPlan);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  useEffect(()=>setDraft(groupPlan),[groupPlan]);
  const today = groupPlan.find(item=>item.day===new Date().getDay());
  const todayExercises = today?.groups?.length ? recommendExercises(today.groups) : [];
  const title = today?.groups?.length ? today.groups.join(' + ') : '';
  const href = `/log-workout?groups=${encodeURIComponent((today?.groups||[]).join(','))}`;
  const setCount = count => setDraft(current=>{
    const kept = current.slice(0,count);
    for (const day of DEFAULT_DAYS) if (kept.length<count && !kept.some(a=>a.day===day)) kept.push({day,groups:[]});
    return kept;
  });
  const update = (index,patch)=>setDraft(current=>current.map((item,i)=>i===index?{...item,...patch}:item));
  const toggleGroup = (index,group)=>{
    const groups = draft[index].groups || [];
    update(index,{template:undefined,groups:groups.includes(group)?groups.filter(g=>g!==group):[...groups,group]});
  };
  const save = async()=>{
    setError('');
    if (draft.some(item=>!item.groups?.length)) {setError('Elegí uno o más grupos musculares para cada día.');return;}
    setSaving(true);
    try {if(await onSavePlan(draft)) setEditing(false);else setError('No se guardó el plan. Intentá de nuevo.');}
    catch {setError('No pudimos guardar el plan.');}
    finally {setSaving(false);}
  };
  if(isLoading) return <div className="mb-8 h-52 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800"/>;
  return <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Plan de hoy · {plan.length} días por semana</p><h2 className="mt-2 text-2xl font-black">{title || (today?'Elegí los grupos de hoy':plan.length?'Día de recuperación':'Configurá tu semana')}</h2><p className="mt-2 text-sm text-slate-500">{title?'Secuencia sugerida: podés cambiar ejercicios y cargas al empezar.':'Elegí los días y los grupos musculares que querés trabajar.'}</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>{setDraft(groupPlan);setError('');setEditing(!editing);}} className="rounded-xl border px-4 py-2 font-bold">{editing?'Cancelar':'Configurar semana'}</button>{title&&<Link to={href} className="rounded-xl bg-emerald-400 px-4 py-2 font-bold text-slate-950">Empezar →</Link>}</div>
    </div>
    {!!todayExercises.length&&<ol className="mt-4 flex flex-wrap gap-2">{todayExercises.map((ex,i)=><li key={ex.name} className="rounded-full bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">{i+1}. {ex.name}</li>)}</ol>}
    {editing&&<div className="mt-6 space-y-4 border-t pt-5">
      <label className="block font-bold">¿Cuántos días vas a entrenar?<select aria-label="Días por semana" value={draft.length} onChange={e=>setCount(Number(e.target.value))} className={`${field} ml-3`}>{Array.from({length:8},(_,n)=><option key={n} value={n}>{n===0?'Sin días programados':`${n} días`}</option>)}</select></label>
      {draft.map((item,index)=>{
        const sequence = item.groups?.length ? recommendExercises(item.groups) : [];
        return <fieldset key={index} className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><legend className="px-2 font-bold">Día {index+1}</legend>
          <label className="block text-sm">Día de la semana<select aria-label={`Día de la semana ${index+1}`} value={item.day} onChange={e=>update(index,{day:Number(e.target.value)})} className={`${field} ml-3`}>{DAYS.map(day=><option key={day.value} value={day.value} disabled={draft.some((a,i)=>i!==index&&a.day===day.value)}>{day.label}</option>)}</select></label>
          <p className="text-sm text-slate-500">Elegí uno o varios grupos musculares.</p>
          <div className="flex flex-wrap gap-2">{MUSCLE_GROUPS.map(group=><button key={group} type="button" aria-pressed={Boolean(item.groups?.includes(group))} onClick={()=>toggleGroup(index,group)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${item.groups?.includes(group)?'border-emerald-500 bg-emerald-400 text-slate-950':'border-slate-300 dark:border-slate-600'}`}>{group}</button>)}</div>
          {!!sequence.length&&<p className="text-sm text-slate-500">Secuencia: {sequence.map((ex,i)=>`${i+1}. ${ex.name}`).join(' → ')}</p>}
        </fieldset>;
      })}
      {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="button" disabled={saving} onClick={save} className="w-full rounded-xl bg-slate-950 p-3 font-bold text-white disabled:opacity-50 dark:bg-emerald-400 dark:text-slate-950">{saving?'Guardando…':`Guardar plan de ${draft.length} días`}</button>
    </div>}
  </section>;
}
