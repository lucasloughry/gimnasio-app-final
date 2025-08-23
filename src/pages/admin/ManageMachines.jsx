import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ManageMachines() {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        // Using the relative path, which works on Vercel
        const response = await axios.get('/api/machines');
        setMachines(response.data);
      } catch (error) {
        console.error("Error fetching machines:", error);
      }
    };
    fetchMachines();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Machines</h1>
        <Link 
          to="/admin/add-machine"
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          + Add Machine
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
                to={`/admin/machine/edit/${machine._id}`}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded"
              >
                Manage
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}