import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Panel de Administrador</h1>
      <p className="mt-4">Bienvenido al área de administración.</p>
      
      <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link 
          to="/admin/checkin"
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 text-lg text-center"
        >
          Escanear QR de Check-in
        </Link>
        <Link 
          to="/admin/add-machine"
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 text-lg text-center"
        >
          Añadir Nueva Máquina
        </Link>
        <Link 
          to="/admin/machines"
          className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 text-lg text-center"
        >
          Gestionar Máquinas
        </Link> {/* <-- Esta es la etiqueta que faltaba */}
        <Link 
          to="/admin/attendance"
          className="bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 text-lg text-center"
        >
          Ver Asistencias  
        </Link>
      </div>
    </div>
  );
}