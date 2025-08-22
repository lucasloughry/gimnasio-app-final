import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditMachine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [exerciseName, setExerciseName] = useState('');
  const [gifFile, setGifFile] = useState(null);

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        // Using relative path
        const response = await axios.get(`/api/machines/${id}`);
        setMachine(response.data);
      } catch (error) {
        console.error("Error fetching machine:", error);
      }
    };
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
      const response = await axios.post(`/api/machines/${id}/exercises`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMachine(response.data);
      setExerciseName('');
      setGifFile(null);
      e.target.reset();
      alert('Ejercicio añadido exitosamente');
    } catch (error) { // <-- AQUÍ ESTÁ LA CORRECCIÓN
      console.error('Error al añadir el ejercicio:', error);
      alert('Error al añadir el ejercicio.');
    }
};

  const handleDeleteExercise = async (exerciseId) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        // Using relative path
        const response = await axios.delete(`/api/machines/${id}/exercises/${exerciseId}`);
        setMachine(response.data.machine);
        alert('Exercise deleted successfully');
      } catch (error) {
        console.error('Error deleting exercise:', error);
        alert('Error deleting exercise.');
      }
    }
  };

  if (!machine) return <p className="p-8">Loading machine...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Manage Machine</h1>
      <h2 className="text-2xl text-gray-700 mb-6">{machine.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Current Exercises</h3>
          {machine.exercises.length > 0 ? (
            <ul className="space-y-3">
              {machine.exercises.map((ex) => (
                <li key={ex._id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {/* Using relative path for the image */}
                    <img src={`/${ex.gifUrl}`} alt={ex.name} className="w-16 h-16 bg-gray-200 rounded"/>
                    <span>{ex.name}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteExercise(ex._id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No exercises for this machine yet.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Add New Exercise</h3>
          <form onSubmit={handleAddExercise} className="space-y-4">
            <div>
              <label htmlFor="exerciseName" className="block text-sm font-medium">Exercise Name</label>
              <input
                type="text"
                id="exerciseName"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="gifFile" className="block text-sm font-medium">GIF File</label>
              <input
                type="file"
                id="gifFile"
                accept="image/gif"
                onChange={(e) => setGifFile(e.target.files[0])}
                className="w-full mt-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
              Add Exercise
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
