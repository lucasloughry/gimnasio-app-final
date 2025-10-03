import { useState, useEffect } from 'react';
    import axios from 'axios';
    
    export default function ManageWorkoutTemplates() {
      const [templates, setTemplates] = useState([]);
      const [name, setName] = useState('');
      const [category, setCategory] = useState('');
      const [exercises, setExercises] = useState([{ name: '', series: '', reps: '' }]);
    
      const fetchTemplates = async () => {
        try {
          const response = await axios.get('/api/templates');
          setTemplates(response.data);
        } catch (error) {
          console.error("Error al obtener las plantillas:", error);
        }
      };
    
      useEffect(() => {
        fetchTemplates();
      }, []);
    
      const handleExerciseChange = (index, event) => {
        const values = [...exercises];
        values[index][event.target.name] = event.target.value;
        setExercises(values);
      };
    
      const addExercise = () => {
        setExercises([...exercises, { name: '', series: '', reps: '' }]);
      };
    
      const removeExercise = (index) => {
        const values = [...exercises];
        values.splice(index, 1);
        setExercises(values);
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await axios.post('/api/templates', { name, category, exercises });
          alert('Plantilla creada con éxito');
          // Limpiar formulario y recargar la lista
          setName('');
          setCategory('');
          setExercises([{ name: '', series: '', reps: '' }]);
          fetchTemplates();
        } catch (error) {
          console.error('Error al crear la plantilla:', error);
          alert('Error al crear la plantilla.');
        }
      };
    
      return (
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">Gestionar Plantillas de Rutina</h1>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Formulario para crear nueva plantilla */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Crear Nueva Plantilla</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">Nombre de la Rutina (ej: Pecho A)</label>
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium">Grupo Muscular (ej: Pecho)</label>
                  <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full mt-1 p-2 border rounded-md"/>
                </div>
    
                <h3 className="text-lg font-semibold border-t pt-4">Ejercicios</h3>
                {exercises.map((exercise, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" name="name" value={exercise.name} onChange={e => handleExerciseChange(index, e)} className="w-full p-2 border rounded-md" placeholder="Nombre del Ejercicio" required />
                    <input type="text" name="series" value={exercise.series} onChange={e => handleExerciseChange(index, e)} className="w-20 p-2 border rounded-md" placeholder="4x" required />
                    <input type="text" name="reps" value={exercise.reps} onChange={e => handleExerciseChange(index, e)} className="w-20 p-2 border rounded-md" placeholder="12" required />
                    {index > 0 && <button type="button" onClick={() => removeExercise(index)} className="text-red-500 font-bold">X</button>}
                  </div>
                ))}
                <button type="button" onClick={addExercise} className="text-sm text-blue-600">+ Añadir Ejercicio</button>
    
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Guardar Plantilla</button>
              </form>
            </div>
    
            {/* Lista de plantillas existentes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Plantillas Existentes</h2>
              <ul className="divide-y divide-gray-200">
                {templates.map(template => (
                  <li key={template._id} className="py-3">
                    <p className="font-bold text-lg">{template.name} <span className="text-sm font-normal text-gray-500">({template.category})</span></p>
                    <ul className="list-disc pl-5 mt-1">
                      {template.exercises.map((ex, i) => <li key={i} className="text-sm">{ex.name} {ex.series}x{ex.reps}</li>)}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }
    