import { useAuth } from '../context/AuthContext';
import QRCode from "react-qr-code";

export default function Profile() {
  const { user } = useAuth();

  // Si el objeto de usuario todavía no se ha cargado, muestra un mensaje.
  if (!user) {
    return <p className="p-4">Cargando perfil...</p>;
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Tu Perfil</h1>
      <p className="text-xl mb-6">Hola, <span className="font-semibold">{user.name}</span></p>

      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4 text-center text-black">Tu QR de acceso</h2>
        <p className="text-center text-gray-600 mb-4">
          Muestra este código en la recepción para registrar tu asistencia.
        </p>
        
        {/* --- LA SOLUCIÓN ESTÁ AQUÍ --- */}
        {/* Solo mostramos el QR si user._id tiene un valor */}
        {user._id ? (
          <QRCode value={user._id} />
        ) : (
          <p>Generando QR...</p>
        )}
      </div>
    </div>
  );
}