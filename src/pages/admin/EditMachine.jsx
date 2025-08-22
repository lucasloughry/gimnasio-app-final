import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function EditMachine() {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [exerciseName, setExerciseName] = useState('');
  const [gifFile, setGifFile] = useState(null);

  const fetchMachine = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/machines/${id}`);
      setMachine(response.data);
    } catch (error) {
      console.error("Error al obtener la máquina:", error);
    }
  };

  useEffect(() => {
    fetchMachine();
  }, [id]);

  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!exerciseName || !gifFile) {
      alert('Por favor, completa el nombre y selecciona un GIF.');
      return;
    }
    const formData = new FormData();
    formData.append('name', exerciseName);
    formData.append('gif', gifFile);
    try {
      const response = await axios.post(`${API_URL}/api/machines/${id}/exercises`, formData);
      setMachine(response.data);
      setExerciseName('');
      setGifFile(null);
      e.target.reset();
    } catch (error) {
      console.error('Error al añadir el ejercicio:', error);
      alert('Error al añadir el ejercicio.');
    }
  };

  // --- FUNCIÓN NUEVA PARA BORRAR ---
  const handleDeleteExercise = async (exerciseId) => {
    if (window.confirm('¿Estás seguro de que quieres borrar este ejercicio?')) {
      try {
        const response = await axios.delete(`${API_URL}/api/machines/${id}/exercises/${exerciseId}`);
        setMachine(response.data.machine); // Actualizamos el estado con la data de la máquina actualizada
        alert('Ejercicio borrado exitosamente');
      } catch (error) {
        console.error('Error al borrar el ejercicio:', error);
        alert('Error al borrar el ejercicio.');
      }
    }
  };

  if (!machine) return <p className="p-8">Cargando máquina...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Gestionar Máquina</h1>
      <h2 className="text-2xl text-gray-700 mb-6">{machine.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sección de ejercicios existentes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Ejercicios Actuales</h3>
          {machine.exercises.length > 0 ? (
            <ul className="space-y-3">
              {machine.exercises.map((ex) => (
                <li key={ex._id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img src={`${API_URL}/${ex.gifUrl}`} alt={ex.name} className="w-16 h-16 bg-gray-200 rounded"/>
                    <span>{ex.name}</span>
                  </div>
                  {/* --- BOTÓN DE BORRAR --- */}
                  <button 
                    onClick={() => handleDeleteExercise(ex._id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Borrar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Aún no hay ejercicios para esta máquina.</p>
          )}
        </div>

        {/* Formulario para añadir nuevo ejercicio */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Añadir Nuevo Ejercicio</h3>
          <form onSubmit={handleAddExercise} className="space-y-4">
            {/* ... (el resto del formulario se queda igual) ... */}
            <div>
              <label htmlFor="exerciseName">Nombre del Ejercicio</label>
              <input type="text" id="exerciseName" value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="gifFile">Archivo GIF</label>
              <input type="file" id="gifFile" accept="image/gif" onChange={(e) => setGifFile(e.target.files[0])} required />
            </div>
            <button type="submit">Añadir Ejercicio</button>
          </form>
        </div>
      </div>
    </div>
  );
}
