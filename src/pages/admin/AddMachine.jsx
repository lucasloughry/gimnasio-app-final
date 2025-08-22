import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AddMachine() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null); // Estado para el archivo de imagen
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Usamos FormData para poder enviar archivos
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.post('http://localhost:5000/api/machines', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Máquina añadida exitosamente');
      navigate('/admin/dashboard');
    } catch (error) {
      alert('Error al añadir la máquina');
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Añadir Nueva Máquina</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-6 bg-white p-8 rounded-lg shadow">
        {/* ... campos de nombre y descripción ... */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="..."/>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className="..."/>
        </div>

        {/* --- CAMPO NUEVO PARA LA IMAGEN --- */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Foto de la Máquina</label>
          <input
            type="file"
            id="image"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button type="submit" className="...">Guardar Máquina</button>
      </form>
    </div>
  );
}
