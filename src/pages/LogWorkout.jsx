import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- 1. Importar useAuth

export default function LogWorkout() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth(); // <-- 2. Obtener la función logout

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        const response = await axios.get('/api/templates', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setTemplates(response.data);
      } catch (error) {
        console.error("Error al obtener las plantillas:", error);
        setError('No pudimos cargar tus rutinas. Revisá tu conexión e intentá nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (templateId) {
      const selected = templates.find(t => t._id === templateId);
      setWorkoutName(selected.name);
      setExercises(selected.exercises.map(ex => ({ name: ex.name, sets: '3', reps: '10', weight: '' })));
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

  const addExercise = () => {
    setExercises(current => [...current, { name: '', sets: '3', reps: '10', weight: '' }]);
  };

  const removeExercise = (index) => {
    setExercises(current => current.filter((_, exerciseIndex) => exerciseIndex !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) throw new Error('No autenticado');
      
      await axios.post(
        '/api/workouts',
        { 
          name: workoutName || 'Entrenamiento libre',
          duration: Number(duration),
          exercises: exercises.map(exercise => ({
            ...exercise,
            sets: Number(exercise.sets),
            reps: Number(exercise.reps),
            weight: Number(exercise.weight || 0),
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
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duración (minutos)</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              placeholder="Ej: 60"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-5">
          <div>
            <h3 className="text-xl font-bold">Ejercicios</h3>
            <p className="text-sm text-slate-500">{exercises.length} cargados</p>
          </div>
          <button type="button" onClick={addExercise} className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-200">+ Agregar</button>
        </div>

        {isLoading && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Cargando rutinas…</p>}
        
        {exercises.map((exercise, index) => (
          <div key={index} className="relative grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-6">
            <button type="button" onClick={() => removeExercise(index)} aria-label={`Quitar ${exercise.name || 'ejercicio'}`} className="absolute right-3 top-3 text-xl text-slate-400 hover:text-red-600">×</button>
            <div className="col-span-3 pr-8 sm:col-span-6">
              <label className="block text-xs font-medium text-gray-600">Ejercicio</label>
              <input type="text" name="name" value={exercise.name} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Nombre del ejercicio" required />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600">Series</label>
              <input type="number" name="sets" value={exercise.sets} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Ej: 4" required />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600">Reps</label>
              <input type="number" name="reps" value={exercise.reps} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Ej: 12" required />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600">Peso (kg)</label>
              <input type="number" name="weight" value={exercise.weight} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="0" min="0" step="0.5" />
            </div>
          </div>
        ))}
        
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
    </div>
  );
}
