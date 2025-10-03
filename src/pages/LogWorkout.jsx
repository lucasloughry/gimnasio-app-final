import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react--router-dom';

export default function LogWorkout() {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '', weight: '' }]);
  const navigate = useNavigate();

  // Maneja los cambios en los inputs de cada ejercicio
  const handleExerciseChange = (index, event) => {
    const values = [...exercises];
    values[index][event.target.name] = event.target.value;
    setExercises(values);
  };

  // Añade una nueva fila de ejercicio vacía
  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }]);
  };

  // Elimina una fila de ejercicio
  const removeExercise = (index) => {
    const values = [...exercises];
    values.splice(index, 1);
    setExercises(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem('userInfo')).token;
      await axios.post(
        '/api/workouts',
        { name, exercises },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('¡Entrenamiento guardado con éxito!');
      navigate('/my-workouts'); // (Crearemos esta página después)
    } catch (error) {
      console.error('Error al guardar el entrenamiento:', error);
      alert('Error al guardar el entrenamiento.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Registrar Nuevo Entrenamiento</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Rutina</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            placeholder="Ej: Tren Inferior"
            required
          />
        </div>

        <h3 className="text-xl font-semibold border-t pt-4">Ejercicios</h3>
        {exercises.map((exercise, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-4 border rounded-md">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600">Ejercicio</label>
              <input type="text" name="name" value={exercise.name} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Nombre" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Series</label>
              <input type="number" name="sets" value={exercise.sets} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Ej: 4" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Repeticiones</label>
              <input type="number" name="reps" value={exercise.reps} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Ej: 12" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Peso (kg)</label>
              <input type="number" name="weight" value={exercise.weight} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Ej: 30" required />
            </div>
            {index > 0 && (
              <button type="button" onClick={() => removeExercise(index)} className="text-red-500 text-sm md:col-span-5 md:text-right">Quitar</button>
            )}
          </div>
        ))}
        
        <div className="flex justify-between">
          <button type="button" onClick={addExercise} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
            + Añadir Ejercicio
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Guardar Entrenamiento
          </button>
        </div>
      </form>
    </div>
  );
}