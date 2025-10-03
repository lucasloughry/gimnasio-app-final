import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MyWorkouts() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo')).token;
        const response = await axios.get('/api/workouts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWorkouts(response.data);
      } catch (error) {
        console.error("Error al obtener los entrenamientos:", error);
      }
    };
    fetchWorkouts();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mi Historial de Entrenamientos</h1>
      <div className="space-y-6">
        {workouts.length > 0 ? (
          workouts.map(workout => (
            <div key={workout._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-600">{workout.name}</h2>
                <p className="text-sm text-gray-500">{new Date(workout.date).toLocaleDateString()}</p>
              </div>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold">Ejercicio</th>
                    <th className="py-2 px-3 text-center font-semibold">Series</th>
                    <th className="py-2 px-3 text-center font-semibold">Repeticiones</th>
                    <th className="py-2 px-3 text-center font-semibold">Peso (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {workout.exercises.map((ex, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-3">{ex.name}</td>
                      <td className="py-2 px-3 text-center">{ex.sets}</td>
                      <td className="py-2 px-3 text-center">{ex.reps}</td>
                      <td className="py-2 px-3 text-center">{ex.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>Aún no has registrado ningún entrenamiento.</p>
        )}
      </div>
    </div>
  );
}