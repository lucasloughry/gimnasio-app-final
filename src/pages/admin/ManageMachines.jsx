import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function ManageMachines() {
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestionar Máquinas</h1>
        <Link 
          to="/admin/add-machine"
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          + Añadir Máquina
        </Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <ul className="divide-y divide-gray-200">
          {machines.map(machine => (
            <li key={machine._id} className="py-4 flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-800">{machine.name}</p>
                <p className="text-sm text-gray-500">{machine.description}</p>
              </div>
              <Link 
                to={`/admin/machine/edit/${machine._id}`} // Futura página de edición
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded"
              >
                Gestionar
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}