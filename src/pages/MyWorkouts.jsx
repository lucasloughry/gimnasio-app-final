import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MyWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  
  const [uniqueExercises, setUniqueExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseProgress, setExerciseProgress] = useState([]);

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
    return data.sort((a, b) => new Date(a.date) - new Date(b.date)).map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      [key]: item[key],
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <h1 className="text-4xl font-bold text-center">Mi Progreso</h1>

      {/* Gráfico de Peso Corporal */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Evolución de Peso Corporal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formatChartData(weightLogs, 'weight')}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Peso (kg)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Progreso por Ejercicio */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Progreso por Ejercicio</h2>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md mb-4"
        >
          <option value="">-- Elige un ejercicio --</option>
          {uniqueExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
        </select>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formatChartData(exerciseProgress, 'weight')}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="#82ca9d" name="Peso levantado (kg)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Secciones de Registro e Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sección de Registro de Peso */}
        <div className="bg-white p-6 rounded-lg shadow">
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
        <div className="bg-white p-6 rounded-lg shadow">
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

