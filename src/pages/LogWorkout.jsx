import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRef } from 'react';
import { MUSCLE_GROUPS, recommendExercises, transitionSeries } from '../training';
import ExerciseDemo from '../components/ExerciseDemo';
import { CATALOG, GROUPS, EQUIPMENT, ROUTINES, REFERENCE, createExercise, seriesOf, suggest, normalizeName } from '../workoutData';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- 1. Importar useAuth

export default function LogWorkout() {
  const [templates, setTemplates] = useState(ROUTINES);
  const [history, setHistory] = useState([]);
  const [historyLoaded,setHistoryLoaded] = useState(false);
  const [muscleGroup, setMuscleGroup] = useState(GROUPS[0]);
  const [exerciseCatalog, setExerciseCatalog] = useState(CATALOG.map(ex=>ex.name));
  const [exerciseMedia, setExerciseMedia] = useState({});
  const [exerciseToAdd, setExerciseToAdd] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [exercises, setExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [sessionStartedAt] = useState(() => Date.now());
  const [muscleGroups,setMuscleGroups] = useState([]);
  const [catalogGroup,setCatalogGroup] = useState('');
  const [search,setSearch] = useState('');
  const [clock,setClock] = useState(Date.now());
  const [restUntil,setRestUntil] = useState(0);
  const groupsInitialized = useRef(false);
  const templateInitialized = useRef(false);
  const activeSet = exercises.some(ex=>ex.series.some(s=>s.startedAt && !s.completed));
  const completedCount = exercises.reduce((n,ex)=>n+ex.series.filter(s=>s.completed).length,0);
  const visibleCatalog = exerciseCatalog.filter(name=>(!catalogGroup || CATALOG.find(ex=>normalizeName(ex.name)===normalizeName(name))?.group===catalogGroup) && normalizeName(name).includes(normalizeName(search)));
  const [restSeconds, setRestSeconds] = useState(0);
  const [restFinished, setRestFinished] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAuth(); // <-- 2. Obtener la función logout

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        const [templatesResponse, machinesResponse] = await Promise.all([
          axios.get('/api/templates', { headers: { Authorization: `Bearer ${userInfo.token}` } }),
          axios.get('/api/machines'),
        ]);
        setTemplates([...ROUTINES, ...templatesResponse.data]);
        setExerciseMedia(Object.fromEntries(machinesResponse.data.flatMap(machine=>(machine.exercises||[]).filter(ex=>ex.gifUrl).map(ex=>[normalizeName(ex.name),ex.gifUrl]))));
        const names = [
          ...CATALOG.map(ex=>ex.name),
          ...templatesResponse.data.flatMap(template => (template.exercises || []).map(exercise => exercise.name)),
          ...machinesResponse.data.flatMap(machine => (machine.exercises || []).map(exercise => exercise.name)),
        ].filter(Boolean);
        setExerciseCatalog([...new Set(names)].sort((a, b) => a.localeCompare(b)));
      } catch (error) {
        console.error("Error al obtener las plantillas:", error);
        setError('No pudimos cargar tus rutinas. Revisá tu conexión e intentá nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
    const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (info?.token) axios.get('/api/workouts', {headers:{Authorization: `Bearer ${info.token}`}}).then(r=>setHistory(r.data)).catch(()=>setError('No pudimos cargar el historial. Podés registrar la sesión, pero las sugerencias no están disponibles.')).finally(()=>setHistoryLoaded(true));
    else setHistoryLoaded(true);
  }, []);

  useEffect(() => {
    if (searchParams.get('groups') || templateInitialized.current) return;
    const templateId = searchParams.get('template');
    if (!templateId || !templates.length || selectedTemplateId) return;
    const selected = templates.find(template => template._id === templateId);
    if (!selected) return;
    templateInitialized.current=true;
    setSelectedTemplateId(selected._id);
    setWorkoutName(selected.name);
    if (GROUPS.includes(selected.category)) setMuscleGroup(selected.category);
    setMuscleGroups([...new Set(selected.exercises.map(ex=>CATALOG.find(meta=>normalizeName(meta.name)===normalizeName(ex.name))?.group).filter(Boolean))]);
    setExercises(selected.exercises.map(exercise => (createExercise(exercise.name, exercise.sets, exercise.reps))));
  }, [searchParams, templates, selectedTemplateId]);

  useEffect(()=>{
    if (groupsInitialized.current || !searchParams.get('exercise')) return;
    const meta=CATALOG.find(ex=>normalizeName(ex.name)===normalizeName(searchParams.get('exercise')));
    if(meta) {groupsInitialized.current=true;setExercises([createExercise(meta.name)]);setWorkoutName(meta.name);setMuscleGroups([meta.group]);}
  },[searchParams]);
  useEffect(()=>{
    const timer=window.setInterval(()=>setClock(Date.now()),1000);
    return ()=>window.clearInterval(timer);
  },[]);
  useEffect(()=>{
    if (groupsInitialized.current || !searchParams.get('groups') || isLoading || !historyLoaded) return;
    const groups=[...new Set(searchParams.get('groups').split(','))].filter(g=>MUSCLE_GROUPS.includes(g));
    groupsInitialized.current=true;
    if(groups.length) {setMuscleGroups(groups);setWorkoutName(groups.join(' + '));setExercises(recommendExercises(groups,history));setSelectedTemplateId('');}
  },[searchParams,isLoading,history,historyLoaded]);
  useEffect(() => {
    if (!restUntil) return;
    const seconds=Math.max(0,Math.ceil((restUntil-Date.now())/1000));
    setRestSeconds(seconds);
    if(!seconds) {setRestUntil(0);setRestFinished(true);if(navigator.vibrate)navigator.vibrate([250,120,250]);}
  },[clock,restUntil]);
  useEffect(()=>{
    if(!restFinished)return;
    const timer=window.setTimeout(()=>setRestFinished(false),7000);
    return ()=>window.clearTimeout(timer);
  },[restFinished]);
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (activeSet) return;
    setMuscleGroups([]);
    setRestUntil(0);
    setRestSeconds(0);
    if (templateId) {
      const selected = templates.find(t => t._id === templateId);
      setWorkoutName(selected.name);
      if(GROUPS.includes(selected.category)) setMuscleGroup(selected.category);
      setMuscleGroups([...new Set(selected.exercises.map(ex=>CATALOG.find(meta=>normalizeName(meta.name)===normalizeName(ex.name))?.group).filter(Boolean))]);
      setExercises(selected.exercises.map(ex => (createExercise(ex.name, ex.sets, ex.reps))));
    } else {
      setExercises([]);
      setWorkoutName('');
    }
  };

  const handleExerciseChange = (index, event) => {
    const values = [...exercises];
    values[index][event.target.name] = event.target.value;
    setExercises(values);
  };

  const addExercise = (name = '') => {
    setExercises(current => [...current, createExercise(name)]);
    setExerciseToAdd('');
  };

  const removeExercise = (index) => {
    setExercises(current => current.filter((_, exerciseIndex) => exerciseIndex !== index));
  };

  const updateSeries = (index, si, field, value) => setExercises(current => current.map((ex,i)=>i===index ? {...ex,series:ex.series.map((set,j)=>j===si?{...set,[field]:value}:set)} : ex));
  const toggleSet = (index,si) => {
    const current=exercises[index].series[si];
    if(current.completed)return;
    if(!current.startedAt && activeSet) {setError('Terminá la serie en curso antes de iniciar otra.');return;}
    if(current.weight==='' || !Number.isFinite(Number(current.weight)) || Number(current.weight)<0 || !Number.isInteger(Number(current.reps)) || Number(current.reps)<1) {setError('Completá peso y repeticiones para iniciar la serie.');return;}
    setError('');
    setExercises(items=>transitionSeries(items,index,si));
    setRestFinished(false);
    setRestUntil(current.startedAt ? Date.now()+60000 : 0);
    setRestSeconds(current.startedAt?60:0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if(activeSet) {setError('Terminá la serie en curso antes de guardar.');return;}
    const logged=exercises.map(ex=>({...ex,series:ex.series.filter(s=>s.completed)})).filter(ex=>ex.series.length);
    if (!logged.length || logged.some(ex=>!ex.name.trim() || ex.series.some(s=>s.weight==='' || !Number.isFinite(Number(s.weight)) || Number(s.weight)<0 || !Number.isInteger(Number(s.reps)) || Number(s.reps)<1 || (s.rir!=='' && (!Number.isInteger(Number(s.rir)) || Number(s.rir)<0 || Number(s.rir)>10))))) {setError('Terminá al menos una serie y revisá sus datos antes de guardar.');return;}
    setIsSaving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) throw new Error('No autenticado');
      
      await axios.post(
        '/api/workouts',
        { 
          name: workoutName || 'Entrenamiento libre',
          muscleGroup: muscleGroups.length ? undefined : muscleGroup,
          muscleGroups,
          duration: Math.max(1, Math.round((Date.now() - sessionStartedAt) / 60000)),
          exercises: logged.map(exercise => ({
            name: exercise.name, equipment: exercise.equipment, unilateral: exercise.unilateral,
            sets: exercise.series.length, reps: Number(exercise.series[0].reps), weight: Number(exercise.series[0].weight),
            series: exercise.series.map(s=>({...s,weight:Number(s.weight),reps:Number(s.reps),rir:s.rir===''?undefined:Number(s.rir)}))
          }))
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      alert('¡Entrenamiento guardado con éxito!');
      navigate('/my-workouts');
    } catch (error) {
      // --- 3. Lógica Mejorada para Manejar Sesión Expirada ---
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        logout(); // Limpiamos la sesión del usuario
        navigate('/login'); // Lo redirigimos al login
      } else {
        console.error('Error al guardar el entrenamiento:', error);
        setError(error.response?.data?.message || 'No pudimos guardar el entrenamiento.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32 pt-8 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Sesión de hoy</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Registrar entrenamiento</h1>
        <p className="mt-2 text-slate-500">Elegí una rutina o armá una sesión libre en el momento.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">Elige una Rutina</label>
            <select
              id="template-select"
              value={selectedTemplateId}
              onChange={handleTemplateChange} disabled={activeSet}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            >
              <option value="">Entrenamiento libre</option>
              {templates.map(template => (
                <option key={template._id} value={template._id}>{template.name} ({template.category})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="workout-name" className="block text-sm font-medium text-gray-700">Nombre de la sesión</label>
            <input id="workout-name" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" placeholder="Ej: Tren superior" required />
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-5">
          <div>
            <h3 className="text-xl font-bold">Ejercicios</h3>
            <p className="text-sm text-slate-500">{exercises.length} cargados</p>
          </div>
          <button type="button" disabled={activeSet} onClick={() => addExercise()} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">+ Crear nuevo</button>
        </div>

        <div className="space-y-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <div className="grid gap-2 sm:grid-cols-2"><label className="text-sm">Filtrar por grupo<select aria-label="Filtrar ejercicios por grupo" value={catalogGroup} onChange={e=>setCatalogGroup(e.target.value)} className="mt-1 w-full rounded-xl border p-3"><option value="">Todos los grupos</option>{MUSCLE_GROUPS.map(g=><option key={g}>{g}</option>)}</select></label><label className="text-sm">Buscar ejercicio<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nombre del ejercicio" className="mt-1 w-full rounded-xl border p-3"/></label></div>
          <select value={exerciseToAdd} onChange={event => setExerciseToAdd(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-300 p-3 dark:border-slate-700">
            <option value="">Elegí un ejercicio existente…</option>
            {MUSCLE_GROUPS.map(group=><optgroup key={group} label={group}>{visibleCatalog.filter(name=>CATALOG.find(ex=>normalizeName(ex.name)===normalizeName(name))?.group===group).map(name=><option key={name} value={name}>{name}</option>)}</optgroup>)}
            <optgroup label="Otros ejercicios del gimnasio">{visibleCatalog.filter(name=>!CATALOG.some(ex=>normalizeName(ex.name)===normalizeName(name))).map(name=><option key={name} value={name}>{name}</option>)}</optgroup>
          </select>
          <button type="button" disabled={!exerciseToAdd || activeSet} onClick={() => addExercise(exerciseToAdd)} className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-40">Agregar ejercicio</button>
        </div>

        {isLoading && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Cargando rutinas…</p>}
        
        <fieldset className="space-y-3" disabled={activeSet}><legend className="font-bold">Grupos de esta sesión</legend><div className="flex flex-wrap gap-2">{MUSCLE_GROUPS.map(g=><button type="button" key={g} aria-pressed={muscleGroups.includes(g)} onClick={()=>setMuscleGroups(current=>current.includes(g)?current.filter(v=>v!==g):[...current,g])} className={`rounded-xl border px-3 py-2 text-sm ${muscleGroups.includes(g)?'bg-emerald-400 text-slate-950':'border-slate-300'}`}>{g}</button>)}</div><button type="button" disabled={!muscleGroups.length} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-40" onClick={()=>{setExercises(recommendExercises(muscleGroups,history));setWorkoutName(muscleGroups.join(' + '));setSelectedTemplateId('');}}>Armar secuencia recomendada</button><p className="text-xs text-slate-500">Reemplaza los ejercicios de esta sesión. Los movimientos principales aparecen antes que los aislados; podés cambiar el orden.</p></fieldset>
        <button type="button" className="rounded-xl border p-3 text-sm" disabled={activeSet} onClick={()=>{setSelectedTemplateId('');setMuscleGroups(['Espalda','Bíceps']);setExercises(structuredClone(REFERENCE));setWorkoutName('Espalda + bíceps · referencia');setMuscleGroup(GROUPS[0]);}}>Cargar sesión de referencia: 16 series (revisar antes de guardar)</button>
        <p className="text-sm text-slate-500">Las reps unilaterales son por lado. Cada fila permite una carga diferente. Tocá la tarjeta para iniciar y terminar cada serie. Al guardar, solo se incluyen las series terminadas.</p>
        {exercises.map((exercise,index)=>{
          const previous = history.flatMap(w=>w.exercises.map(ex=>({...ex,date:w.date}))).find(ex=>normalizeName(ex.name)===normalizeName(exercise.name) && (!ex.equipment || ex.equipment===exercise.equipment) && Boolean(ex.unilateral)===exercise.unilateral);
          const recommendation = previous && suggest(exercise,previous);
          return <section key={index} className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex gap-3"><input aria-label="Nombre del ejercicio" name="name" value={exercise.name} onChange={e=>handleExerciseChange(index,e)} required className="min-w-0 flex-1 rounded border p-2 font-bold"/><button type="button" disabled={activeSet} onClick={()=>removeExercise(index)} aria-label={'Quitar '+exercise.name}>×</button></div>
            <ExerciseDemo name={exercise.name} customUrl={exerciseMedia[normalizeName(exercise.name)]}/>
            <select disabled={activeSet} aria-label="Convención de carga" name="equipment" value={exercise.equipment} onChange={e=>handleExerciseChange(index,e)} className="w-full rounded border p-2">{Object.entries(EQUIPMENT).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select>
            <label className="flex gap-2 text-sm"><input type="checkbox" disabled={activeSet} checked={exercise.unilateral} onChange={e=>setExercises(current=>current.map((ex,i)=>i===index?{...ex,unilateral:e.target.checked}:ex))}/>Unilateral · repeticiones por lado</label>
            {previous && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-950"><p>Última sesión ({new Date(previous.date).toLocaleDateString('es-AR')}): {seriesOf(previous).map(s=>s.weight+' × '+s.reps).join(' · ')}</p><p>{recommendation.reason}</p><button type="button" className="mt-2 underline" disabled={activeSet} onClick={()=>setExercises(current=>current.map((ex,i)=>i===index?{...ex,series:recommendation.series}:ex))}>Usar sugerencia: {recommendation.series.map(s=>s.weight+' × '+s.reps).join(' · ')}</button></div>}
            {exercise.series.map((set,si)=><div key={si} className={`relative rounded-xl border-2 p-4 pb-12 transition ${set.completed?'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30':set.startedAt?'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30':'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'}`}>
              <button type="button" onClick={()=>toggleSet(index,si)} disabled={set.completed || (activeSet && !set.startedAt)} aria-label={`${set.completed?'Serie terminada':set.startedAt?'Terminar':'Iniciar'} serie ${si+1} de ${exercise.name}`} className="absolute inset-0 w-full rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500 disabled:cursor-default"><span className="absolute bottom-3 left-4 text-sm font-bold">{set.completed?'✓ Terminada':set.startedAt?`■ Terminar serie · ${Math.max(0,Math.floor((clock-set.startedAt)/1000))} s`:'▶ Tocar para iniciar serie'}</span></button>
              <div className="pointer-events-none relative">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><span className="col-span-2 text-sm font-bold sm:col-span-4">Serie {si+1}{set.completed?' · completada':''}</span>
              <label className="pointer-events-auto text-xs">Peso (kg)<input type="number" min="0" step="0.5" required value={set.weight} onChange={e=>updateSeries(index,si,'weight',e.target.value)} className="mt-1 w-full rounded border p-2"/></label>
              <label className="pointer-events-auto text-xs">Reps {exercise.unilateral?'por lado':''}<input type="number" min="1" step="1" required value={set.reps} onChange={e=>updateSeries(index,si,'reps',e.target.value)} className="mt-1 w-full rounded border p-2"/></label>
              <label className="pointer-events-auto text-xs">Sensación<select value={set.effort} onChange={e=>updateSeries(index,si,'effort',e.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Sin registrar</option><option value="easy">Fácil</option><option value="hard">Últimas difíciles</option><option value="limit">Al límite</option></select></label>
              <label className="pointer-events-auto text-xs">RIR (reps restantes)<input type="number" min="0" max="10" step="1" value={set.rir} onChange={e=>updateSeries(index,si,'rir',e.target.value)} className="mt-1 w-full rounded border p-2"/></label></div>
              <input aria-label={'Notas serie '+(si+1)} placeholder="Sensaciones o notas" value={set.notes} onChange={e=>updateSeries(index,si,'notes',e.target.value)} className="pointer-events-auto mt-2 w-full rounded border p-2 text-sm"/>
              <div className="mt-2 flex justify-end"><button type="button" disabled={activeSet || exercise.series.length===1} onClick={()=>setExercises(current=>current.map((ex,i)=>i===index?{...ex,series:ex.series.filter((_,j)=>j!==si)}:ex))} className="pointer-events-auto text-xs text-slate-500">Quitar serie</button></div>
              </div>
            </div>)}
            <button disabled={activeSet} type="button" onClick={()=>setExercises(current=>current.map((ex,i)=>i===index?{...ex,series:[...ex.series,{...ex.series.at(-1),startedAt:undefined,finishedAt:undefined,effort:'',rir:'',notes:'',completed:false}]}:ex))} className="text-sm font-bold">+ Agregar serie</button>
            <div className="flex gap-4 text-sm"><button type="button" disabled={activeSet||index===0} onClick={()=>setExercises(current=>{const next=[...current];[next[index-1],next[index]]=[next[index],next[index-1]];return next;})}>↑ Subir ejercicio</button><button type="button" disabled={activeSet||index===exercises.length-1} onClick={()=>setExercises(current=>{const next=[...current];[next[index],next[index+1]]=[next[index+1],next[index]];return next;})}>↓ Bajar ejercicio</button></div>
          </section>;
        })}

        {exercises.length > 0 && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving || activeSet || !completedCount}
              className="w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
            >
              {isSaving ? 'Guardando…' : `Guardar entrenamiento · ${completedCount} series terminadas`}
            </button>
          </div>
        )}
      </form>
      {restSeconds > 0 && <button type="button" onClick={() => {setRestSeconds(0);setRestUntil(0);}} className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-slate-950 px-5 py-3 text-white shadow-2xl ring-1 ring-white/10"><span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-400 font-black text-slate-950">{restSeconds}</span><span className="text-left"><strong className="block">Descansando</strong><small className="text-slate-400">Tocá para omitir</small></span></button>}
      {restFinished && <div role="status" className="pointer-events-none fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-emerald-400 p-4 text-center font-black text-slate-950 shadow-2xl">¡Descanso terminado! Próxima serie 💪</div>}
    </div>
  );
}
