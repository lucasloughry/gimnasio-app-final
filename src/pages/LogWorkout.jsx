import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LogWorkout() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const navigate = useNavigate();

  // 1. Cargar todas las plantillas de rutina al iniciar
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/templates');
        setTemplates(response.data);
      } catch (error) {
        console.error("Error al obtener las plantillas:", error);
      }
    };
    fetchTemplates();
  }, []);

  // 2. Cuando el usuario elige una plantilla, cargamos sus ejercicios
  const handleTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setWorkoutName('');
      setExercises([]);
      return;
    }
    const selectedTemplate = templates.find(t => t._id === templateId);
    if (selectedTemplate) {
      setWorkoutName(selectedTemplate.name);
      // Preparamos los ejercicios para que el usuario llene los campos
      setExercises(selectedTemplate.exercises.map(ex => ({
        name: ex.name,
        sets: ex.series, // Usamos las series de la plantilla como sugerencia
        reps: ex.reps,   // Usamos las repeticiones de la plantilla como sugerencia
        weight: ''       // El peso lo debe llenar el usuario
      })));
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
      const token = JSON.parse(localStorage.getItem('userInfo')).token;
      await axios.post(
        '/api/workouts',
        { name: workoutName, exercises },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('¡Entrenamiento guardado con éxito!');
      navigate('/my-workouts');
    } catch (error) {
      console.error('Error al guardar el entrenamiento:', error);
      alert('Error al guardar el entrenamiento.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Registrar Nuevo Entrenamiento</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
        
        {/* Menú para seleccionar la plantilla */}
        <div>
          <label htmlFor="template" className="block text-sm font-medium text-gray-700">Elige una Rutina</label>
          <select
            id="template"
            value={selectedTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          >
            <option value="">-- Selecciona una plantilla --</option>
            {templates.map(template => (
              <option key={template._id} value={template._id}>
                {template.name} ({template.category})
              </option>
            ))}
          </select>
        </div>

        {/* Los ejercicios aparecen cuando se selecciona una plantilla */}
        {exercises.length > 0 && (
          <>
            <h3 className="text-xl font-semibold border-t pt-4">Ejercicios de la Rutina: {workoutName}</h3>
            {exercises.map((exercise, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-md">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600">Ejercicio</label>
                  <p className="w-full mt-1 p-2 font-semibold">{exercise.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Series x Reps</label>
                  <div className="flex items-center mt-1">
                    <input type="text" name="sets" value={exercise.sets} onChange={e => handleExerciseChange(index, e)} className="w-16 p-2 border rounded-md" required />
                    <span className="mx-2">x</span>
                    <input type="text" name="reps" value={exercise.reps} onChange={e => handleExerciseChange(index, e)} className="w-16 p-2 border rounded-md" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Peso (kg)</label>
                  <input type="number" name="weight" value={exercise.weight} onChange={e => handleExerciseChange(index, e)} className="w-full mt-1 p-2 border rounded-md" placeholder="Ej: 30" required />
                </div>
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Guardar Entrenamiento
            </button>
          </>
        )}
      </form>
    </div>
  );
}