import { useState, useEffect } from 'react';
import axios from 'axios';
// Importamos los componentes necesarios para el gráfico
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MyWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [newWeight, setNewWeight] = useState('');

  // Función para obtener los datos
  const fetchData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo')).token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const workoutsRes = await axios.get('/api/workouts', config);
      const weightRes = await axios.get('/api/weight', config);

      setWorkouts(workoutsRes.data);
      setWeightHistory(weightRes.data);
    } catch (error) {
      console.error("Error al obtener los datos de progreso:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para guardar un nuevo registro de peso
  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    if (!newWeight) return;

    try {
      const token = JSON.parse(localStorage.getItem('userInfo')).token;
      await axios.post('/api/weight', { weight: newWeight }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewWeight('');
      fetchData(); // Volver a cargar todos los datos para refrescar la lista
      alert('¡Peso registrado con éxito!');
    } catch (error) {
      console.error('Error al registrar el peso:', error);
      alert('Error al registrar el peso.');
    }
  };

  // Preparamos los datos para el gráfico
  const formattedWeightData = weightHistory.map(log => ({
    date: new Date(log.date).toLocaleDateString(),
    peso: log.weight,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Mi Progreso</h1>
      
      {/* Nuevo contenedor para el gráfico */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Evolución de Peso</h2>
        {/* Usamos ResponsiveContainer para que el gráfico se adapte al tamaño */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedWeightData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="peso" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna de Seguimiento de Peso */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Peso Corporal</h2>
          <form onSubmit={handleWeightSubmit} className="flex items-center space-x-2 mb-6">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Tu peso en kg"
              required
            />
            <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
              Guardar
            </button>
          </form>
          <h3 className="text-lg font-semibold mb-2">Historial</h3>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {weightHistory.map(log => (
              <li key={log._id} className="flex justify-between p-2 bg-gray-50 rounded">
                <span>{new Date(log.date).toLocaleDateString()}</span>
                <span className="font-semibold">{log.weight} kg</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna de Historial de Entrenamientos */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Historial de Entrenamientos</h2>
          <div className="space-y-4 max-h-[30rem] overflow-y-auto">
            {workouts.length > 0 ? (
              workouts.map((workout) => (
                <div key={workout._id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">{workout.name}</h3>
                    <p className="text-sm text-gray-500">{new Date(workout.date).toLocaleDateString()}</p>
                  </div>
                  <ul>
                    {workout.exercises.map((ex, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {ex.name}: {ex.sets} series de {ex.reps} reps con {ex.weight} kg
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p>Aún no has registrado ningún entrenamiento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}