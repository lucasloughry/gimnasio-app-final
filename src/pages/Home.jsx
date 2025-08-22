import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// ESTA ES LA LÍNEA QUE NECESITAS RESTAURAR
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Home() {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/machines`);
        setMachines(response.data);
      } catch (error) {
        console.error("Error al obtener las máquinas:", error);
      }
    };
    fetchMachines();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Máquinas disponibles</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {machines.map(m => (
          <div key={m._id} className="bg-white shadow p-4 rounded-lg flex flex-col">
            {m.image && (
              <img 
                src={`${API_URL}/${m.image.replace(/\\/g, '/')}`} 
                alt={m.name} 
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h2 className="font-semibold">{m.name}</h2>
            <p className="text-sm text-gray-600 flex-grow">{m.description}</p>
            <Link
              to={`/maquina/${m._id}`}
              className="text-blue-500 mt-2 inline-block self-start"
            >
              Ver más →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}