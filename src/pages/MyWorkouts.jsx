import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ExerciseProgress3D from '../components/ExerciseProgress3D';

export default function MyWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  
  const [uniqueExercises, setUniqueExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const token = user?.token;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [workoutsRes, weightLogsRes] = await Promise.all([
          axios.get('/api/workouts', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/weight', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setWorkouts(workoutsRes.data);
        setWeightLogs(weightLogsRes.data);

        const allExercises = workoutsRes.data.flatMap(w => w.exercises.map(e => e.name));
        setUniqueExercises([...new Set(allExercises)]);

      } catch (error) {
        console.error("Error al obtener los datos de progreso:", error);
        setError('No pudimos cargar tu progreso. Intentá nuevamente en unos segundos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (selectedExercise && token) {
      const fetchExerciseProgress = async () => {
        try {
          const response = await axios.get(`/api/workouts/progress/${selectedExercise}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setExerciseProgress(response.data);
        } catch (error) {
          console.error("Error al obtener el progreso del ejercicio:", error);
        }
      };
      fetchExerciseProgress();
    }
  }, [selectedExercise, token]);

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    try {
      const response = await axios.post('/api/weight', { weight: newWeight }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeightLogs([response.data, ...weightLogs]);
      setNewWeight('');
    } catch (error) {
      console.error("Error al añadir el peso:", error);
    }
  };

  const formatChartData = (data, key) => {
    return [...data].sort((a, b) => new Date(a.date) - new Date(b.date)).map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      [key]: item[key],
    }));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-400">Rendimiento</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Tu progreso, visible.</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Explorá cómo evolucionan tu fuerza, volumen y peso a través del tiempo.</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl bg-white/10 px-5 py-3"><strong className="block text-2xl">{workouts.length}</strong><span className="text-xs text-slate-400">sesiones</span></div>
            <div className="rounded-2xl bg-emerald-400 px-5 py-3 text-slate-950"><strong className="block text-2xl">{uniqueExercises.length}</strong><span className="text-xs font-semibold">ejercicios</span></div>
          </div>
        </div>
      </header>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700" role="alert">{error}</div>}
      {isLoading && <div className="animate-pulse rounded-3xl bg-slate-200 p-16 text-center text-slate-500">Cargando tu progreso…</div>}

      {/* Gráfico de Peso Corporal */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Composición</p><h2 className="mt-1 text-2xl font-black">Peso corporal</h2></div>
          {weightLogs[0] && <span className="rounded-full bg-emerald-50 px-4 py-2 font-bold text-emerald-700">{weightLogs[0].weight} kg</span>}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formatChartData(weightLogs, 'weight')}>
            <defs><linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={38} />
            <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 12px 30px rgba(15,23,42,.12)' }} />
            <Area type="monotone" dataKey="weight" stroke="#059669" strokeWidth={4} fill="url(#weightFill)" name="Peso (kg)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Progreso por Ejercicio */}
      <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl sm:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Fuerza</p><h2 className="mt-1 text-2xl font-black">Progreso por ejercicio</h2></div>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-800 p-3 text-white md:w-1/3"
        >
          <option value="">-- Elige un ejercicio --</option>
          {uniqueExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
        </select>
        </div>
        <ExerciseProgress3D data={exerciseProgress} />
      </div>

      {/* Secciones de Registro e Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sección de Registro de Peso */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold mb-4">Registro de Peso Corporal</h2>
          <form onSubmit={handleAddWeight} className="flex items-end gap-4 mb-6">
            <div>
              <label htmlFor="newWeight" className="block text-sm font-medium text-gray-700">Peso actual (kg)</label>
              <input
                type="number"
                id="newWeight"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Ej: 80.5"
                step="0.1"
                required
              />
            </div>
            <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">
              Registrar
            </button>
          </form>
          <h3 className="text-xl font-semibold mb-2">Historial de Peso</h3>
          <div className="max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {weightLogs.map(log => (
                <li key={log._id} className="py-2 flex justify-between">
                  <span>{new Date(log.date).toLocaleDateString()}</span>
                  <span className="font-semibold">{log.weight} kg</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sección de Historial de Entrenamientos */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold mb-4">Historial de Entrenamientos</h2>
          <div className="max-h-96 overflow-y-auto">
            <ul className="space-y-4">
              {workouts.map(workout => (
                <li key={workout._id} className="border p-4 rounded-md bg-gray-50">
                  <p className="font-bold">{workout.name} - <span className="font-normal text-gray-600">{new Date(workout.date).toLocaleDateString()}</span> - <span className="font-normal text-gray-600">{workout.duration} min</span></p>
                  <ul className="list-disc ml-6 mt-2 text-sm">
                    {workout.exercises.map((ex, i) => (
                      <li key={i}>{ex.name}: {ex.sets}x{ex.reps} con {ex.weight}kg</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

