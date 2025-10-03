import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- 1. Importar useAuth

export default function LogWorkout() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState([]);
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
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (templateId) {
      const selected = templates.find(t => t._id === templateId);
      setExercises(selected.exercises.map(ex => ({ name: ex.name, sets: '', reps: '', weight: '' })));
    } else {
      setExercises([]);
    }
  };

  const handleExerciseChange = (index, event) => {
    const values = [...exercises];
    values[index][event.target.name] = event.target.value;
    setExercises(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) throw new Error('No autenticado');
      
      const selectedTemplate = templates.find(t => t._id === selectedTemplateId);
      
      await axios.post(
        '/api/workouts',
        { 
          name: selectedTemplate.name,
          duration,
          exercises 
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
        alert('Error al guardar el entrenamiento.');
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Registrar Entrenamiento</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
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
              <option value="">-- Selecciona una plantilla --</option>
              {templates.map(template => (
                <option key={template._id} value={template._id}>{template.name} ({template.category})</option>
              ))}
            </select>
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

        {exercises.length > 0 && <h3 className="text-xl font-semibold border-t pt-4">Ejercicios</h3>}
        
        {exercises.map((exercise, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-md">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600">Ejercicio</label>
              <input type="text" name="name" value={exercise.name} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md bg-gray-100" readOnly />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Series</label>
              <input type="number" name="sets" value={exercise.sets} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Ej: 4" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Reps</label>
              <input type="number" name="reps" value={exercise.reps} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Ej: 12" required />
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-gray-600">Peso (kg)</label>
              <input type="number" name="weight" value={exercise.weight} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Ej: 30" required />
            </div>
          </div>
        ))}
        
        {selectedTemplateId && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Guardar Entrenamiento
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
