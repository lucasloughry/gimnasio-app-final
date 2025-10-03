import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MyWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  
  // Estados nuevos para el gráfico de ejercicios
  const [uniqueExercises, setUniqueExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [progressData, setProgressData] = useState([]);

  // Función para obtener todos los datos iniciales
  const fetchData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo')).token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [workoutsRes, weightRes] = await Promise.all([
        axios.get('/api/workouts', config),
        axios.get('/api/weight', config)
      ]);

      setWorkouts(workoutsRes.data);
      setWeightHistory(weightRes.data);

      // Extraer nombres de ejercicios únicos para el menú desplegable
      const allExercises = workoutsRes.data.flatMap(w => w.exercises.map(e => e.name));
      setUniqueExercises([...new Set(allExercises)]);

    } catch (error) {
      console.error("Error al obtener los datos de progreso:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Este efecto se ejecuta cuando el usuario selecciona un ejercicio del menú
  useEffect(() => {
    if (selectedExercise) {
      const fetchProgress = async () => {
        try {
          const token = JSON.parse(localStorage.getItem('userInfo')).token;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(`/api/workouts/progress/${selectedExercise}`, config);
          
          // Formatear los datos para el gráfico
          const formattedData = response.data.map(item => ({
            date: new Date(item.date).toLocaleDateString(),
            peso: item.weight,
          }));
          setProgressData(formattedData);
        } catch (error) {
          console.error("Error al obtener el progreso del ejercicio:", error);
        }
      };
      fetchProgress();
    }
  }, [selectedExercise]);

  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    try {
      const token = JSON.parse(localStorage.getItem('userInfo')).token;
      await axios.post('/api/weight', { weight: newWeight }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewWeight('');
      fetchData();
      alert('¡Peso registrado con éxito!');
    } catch (error) {
      console.error('Error al registrar el peso:', error);
      alert('Error al registrar el peso.');
    }
  };

  // Preparamos los datos para el gráfico de peso corporal
  const formattedWeightData = weightHistory.map(log => ({
    date: new Date(log.date).toLocaleDateString(),
    peso: log.weight,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Mi Progreso</h1>
      
      {/* Gráfico de Peso Corporal */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Evolución de Peso Corporal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedWeightData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Progreso de Ejercicios */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Progreso por Ejercicio</h2>
        <div className="mb-4">
          <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 mb-2">Selecciona un ejercicio para ver tu progreso:</label>
          <select 
            id="exercise-select"
            value={selectedExercise}
            onChange={e => setSelectedExercise(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Elige un ejercicio --</option>
            {uniqueExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="peso" name="Peso levantado (kg)" stroke="#82ca9d" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Secciones de registro e historial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ... (Las secciones de "Peso Corporal" e "Historial de Entrenamientos" se quedan igual) ... */}
      </div>
    </div>
  );
}