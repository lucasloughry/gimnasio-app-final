import { useState, useEffect } from 'react';
import axios from 'axios';
import { CATALOG, GROUPS, EQUIPMENT, ROUTINES, REFERENCE, createExercise, seriesOf, suggest, normalizeName } from '../workoutData';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- 1. Importar useAuth

export default function LogWorkout() {
  const [templates, setTemplates] = useState(ROUTINES);
  const [history, setHistory] = useState([]);
  const [muscleGroup, setMuscleGroup] = useState(GROUPS[0]);
  const [exerciseCatalog, setExerciseCatalog] = useState(CATALOG.map(ex=>ex.name));
  const [exerciseToAdd, setExerciseToAdd] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [exercises, setExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [sessionStartedAt] = useState(() => Date.now());
  const [completedSets, setCompletedSets] = useState({});
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
    if (info?.token) axios.get('/api/workouts', {headers:{Authorization: `Bearer ${info.token}`}}).then(r=>setHistory(r.data)).catch(()=>setError('No pudimos cargar el historial. Podés registrar la sesión, pero las sugerencias no están disponibles.'));
  }, []);

  useEffect(() => {
    const templateId = searchParams.get('template');
    if (!templateId || !templates.length || selectedTemplateId) return;
    const selected = templates.find(template => template._id === templateId);
    if (!selected) return;
    setSelectedTemplateId(selected._id);
    setWorkoutName(selected.name);
    if (GROUPS.includes(selected.category)) setMuscleGroup(selected.category);
    setExercises(selected.exercises.map(exercise => (createExercise(exercise.name, exercise.sets, exercise.reps))));
  }, [searchParams, templates, selectedTemplateId]);

  useEffect(() => {
    if (restSeconds <= 0) return undefined;
    const timer = window.setTimeout(() => {
      if (restSeconds > 1) {
        setRestSeconds(restSeconds - 1);
        return;
      }
      setRestSeconds(0);
      setRestFinished(true);
      window.setTimeout(() => setRestFinished(false), 7000);
      if (navigator.vibrate) navigator.vibrate([250, 120, 250]);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Descanso terminado 💪', { body: 'Es momento de comenzar la próxima serie.', icon: '/pwa-192x192.png' });
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [restSeconds]);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    setCompletedSets({});
    setRestSeconds(0);
    if (templateId) {
      const selected = templates.find(t => t._id === templateId);
      setWorkoutName(selected.name);
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
  const finishSet = (index, si) => {
    updateSeries(index, si, 'completed', true);
    setRestFinished(false); setRestSeconds(60);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!exercises.length || exercises.some(ex=>!ex.name.trim() || !ex.series.length || ex.series.some(s=>s.weight==='' || !Number.isFinite(Number(s.weight)) || Number(s.weight)<0 || !Number.isInteger(Number(s.reps)) || Number(s.reps)<1))) { setError('Completá peso y repeticiones en cada serie. Usá 0 para peso corporal sin carga.'); return; }
    setIsSaving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) throw new Error('No autenticado');
      
      await axios.post(
        '/api/workouts',
        { 
          name: workoutName || 'Entrenamiento libre',
          muscleGroup,
          duration: Math.max(1, Math.round((Date.now() - sessionStartedAt) / 60000)),
          exercises: exercises.map(exercise => ({
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Sesión de hoy</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Registrar entrenamiento</h1>
        <p className="mt-2 text-slate-500">Elegí una rutina o armá una sesión libre en el momento.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">Elige una Rutina</label>
            <select
              id="template-select"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              required
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
          <button type="button" onClick={() => addExercise()} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">+ Crear nuevo</button>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60 sm:flex-row">
          <select value={exerciseToAdd} onChange={event => setExerciseToAdd(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-300 p-3 dark:border-slate-700">
            <option value="">Elegí un ejercicio existente…</option>
            {exerciseCatalog.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <button type="button" disabled={!exerciseToAdd} onClick={() => addExercise(exerciseToAdd)} className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-40">Agregar ejercicio</button>
        </div>

        {isLoading && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Cargando rutinas…</p>}
        
        <label className="block">Grupo muscular<select value={muscleGroup} onChange={e=>setMuscleGroup(e.target.value)} className="ml-3 rounded border p-2">{GROUPS.map(g=><option key={g}>{g}</option>)}</select></label>
        <button type="button" className="rounded-xl border p-3 text-sm" onClick={()=>{setExercises(structuredClone(REFERENCE));setWorkoutName('Espalda + bíceps · referencia');setMuscleGroup(GROUPS[0]);}}>Cargar sesión de referencia: 16 series (revisar antes de guardar)</button>
        <p className="text-sm text-slate-500">Las reps unilaterales son por lado. Cada fila permite una carga diferente. La referencia no se guarda automáticamente ni tiene una fecha inventada.</p>
        {exercises.map((exercise,index)=>{
          const previous = history.flatMap(w=>w.exercises.map(ex=>({...ex,date:w.date}))).find(ex=>normalizeName(ex.name)===normalizeName(exercise.name) && (!ex.equipment || ex.equipment===exercise.equipment) && Boolean(ex.unilateral)===exercise.unilateral);
          const recommendation = previous && suggest(exercise,previous);
          return <section key={index} className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex gap-3"><input aria-label="Nombre del ejercicio" name="name" value={exercise.name} onChange={e=>handleExerciseChange(index,e)} required className="min-w-0 flex-1 rounded border p-2 font-bold"/><button type="button" onClick={()=>removeExercise(index)} aria-label={'Quitar '+exercise.name}>×</button></div>
            <select aria-label="Convención de carga" name="equipment" value={exercise.equipment} onChange={e=>handleExerciseChange(index,e)} className="w-full rounded border p-2">{Object.entries(EQUIPMENT).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={exercise.unilateral} onChange={e=>setExercises(current=>current.map((ex,i)=>i===index?{...ex,unilateral:e.target.checked}:ex))}/>Unilateral · repeticiones por lado</label>
            {previous && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-950"><p>Última sesión ({new Date(previous.date).toLocaleDateString('es-AR')}): {seriesOf(previous).map(s=>s.weight+' × '+s.reps).join(' · ')}</p><p>{recommendation.reason}</p><button type="button" className="mt-2 underline" onClick={()=>setExercises(current=>current.map((ex,i)=>i===index?{...ex,series:recommendation.series}:ex))}>Usar sugerencia: {recommendation.series.map(s=>s.weight+' × '+s.reps).join(' · ')}</button></div>}
            {exercise.series.map((set,si)=><div key={si} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><span className="col-span-2 text-sm font-bold sm:col-span-4">Serie {si+1}{set.completed?' · completada':''}</span>
              <label className="text-xs">Peso (kg)<input type="number" min="0" step="0.5" required value={set.weight} onChange={e=>updateSeries(index,si,'weight',e.target.value)} className="mt-1 w-full rounded border p-2"/></label>
              <label className="text-xs">Reps {exercise.unilateral?'por lado':''}<input type="number" min="1" step="1" required value={set.reps} onChange={e=>updateSeries(index,si,'reps',e.target.value)} className="mt-1 w-full rounded border p-2"/></label>
              <label className="text-xs">Sensación<select value={set.effort} onChange={e=>updateSeries(index,si,'effort',e.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Sin registrar</option><option value="easy">Fácil</option><option value="hard">Últimas difíciles</option><option value="limit">Al límite</option></select></label>
              <label className="text-xs">RIR (reps restantes)<input type="number" min="0" max="10" step="1" value={set.rir} onChange={e=>updateSeries(index,si,'rir',e.target.value)} className="mt-1 w-full rounded border p-2"/></label></div>
              <input aria-label={'Notas serie '+(si+1)} placeholder="Sensaciones o notas" value={set.notes} onChange={e=>updateSeries(index,si,'notes',e.target.value)} className="mt-2 w-full rounded border p-2 text-sm"/>
              <div className="mt-2 flex justify-between gap-2"><button type="button" disabled={set.completed || set.weight==='' || Number(set.reps)<1} onClick={()=>finishSet(index,si)} className="text-sm font-bold text-emerald-600 disabled:opacity-40">✓ Terminar · descansar 1:00</button><button type="button" disabled={exercise.series.length===1} onClick={()=>setExercises(current=>current.map((ex,i)=>i===index?{...ex,series:ex.series.filter((_,j)=>j!==si)}:ex))} className="text-sm">Quitar serie</button></div>
            </div>)}
            <button type="button" onClick={()=>setExercises(current=>current.map((ex,i)=>i===index?{...ex,series:[...ex.series,{...ex.series.at(-1),effort:'',rir:'',notes:'',completed:false}]}:ex))} className="text-sm font-bold">+ Agregar serie</button>
          </section>;
        })}

        {exercises.length > 0 && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
            >
              {isSaving ? 'Guardando…' : 'Guardar entrenamiento'}
            </button>
          </div>
        )}
      </form>
      {restSeconds > 0 && <button type="button" onClick={() => setRestSeconds(0)} className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-slate-950 px-5 py-3 text-white shadow-2xl ring-1 ring-white/10"><span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-400 font-black text-slate-950">{restSeconds}</span><span className="text-left"><strong className="block">Descansando</strong><small className="text-slate-400">Tocá para omitir</small></span></button>}
      {restFinished && <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-emerald-400 p-4 text-center font-black text-slate-950 shadow-2xl">¡Descanso terminado! Próxima serie 💪</div>}
    </div>
  );
}
