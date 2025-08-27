import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AttendanceLog() {
  const [attendances, setAttendances] = useState([]);
  const [filteredAttendances, setFilteredAttendances] = useState([]);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const response = await axios.get('/api/attendance');
        setAttendances(response.data);
        setFilteredAttendances(response.data);
      } catch (error) {
        console.error("Error al obtener las asistencias:", error);
      }
    };
    fetchAttendances();
  }, []);

  useEffect(() => {
    if (filterDate) {
      const filtered = attendances.filter(att => {
        const attDate = new Date(att.checkinTime).toISOString().split('T')[0];
        return attDate === filterDate;
      });
      setFilteredAttendances(filtered);
    } else {
      setFilteredAttendances(attendances);
    }
  }, [filterDate, attendances]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Registro de Asistencias</h1>
      
      <div className="mb-6 flex items-center space-x-4">
        <div>
          <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-2">Filtrar por día:</label>
          <input 
            type="date" 
            id="filterDate"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button onClick={() => setFilterDate('')} className="self-end p-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300">
          Limpiar filtro
        </button>
      </div>

      {/* --- CONTADOR DE ASISTENCIAS NUEVO --- */}
      <div className="mb-4 text-lg bg-gray-100 p-4 rounded-md">
        <span className="font-semibold">Asistencias mostradas:</span> {filteredAttendances.length}
      </div>

      {/* Tabla de asistencias */}
      <div className="bg-white p-6 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Socio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora de Ingreso</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAttendances.map(att => (
              <tr key={att._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{att.user ? att.user.name : 'Usuario eliminado'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(att.checkinTime).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(att.checkinTime).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}