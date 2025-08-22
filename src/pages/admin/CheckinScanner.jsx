import { useState } from 'react';
import { useZxing } from 'react-zxing';
import axios from 'axios';

export default function CheckinScanner() {
  const [message, setMessage] = useState('');
  const [isPaused, setIsPaused] = useState(true);

  const { ref } = useZxing({
    paused: isPaused,
    onResult(scannedResult) {
      const scannedUserId = scannedResult.getText();
      handleCheckin(scannedUserId);
      setIsPaused(true); // Pausar después de un escaneo exitoso
    },
  });

  const handleCheckin = async (userId) => {
    try {
      // AQUÍ ESTÁ LA CORRECCIÓN: Usamos la ruta relativa
      const response = await axios.post('/api/attendance/checkin', {
        userId: userId,
      });
      setMessage(`✅ ¡Éxito! Check-in de ${response.data.userName} registrado.`);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || 'No se pudo registrar el check-in'}`);
    }
  };
  
  const handleStartScanner = () => {
    setMessage('');
    setIsPaused(false);
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Escaner de Check-in</h1>
      <div className="w-full max-w-md bg-gray-200 rounded-lg overflow-hidden shadow-md">
        <video ref={ref} className="w-full" />
      </div>

      {isPaused && (
        <button 
          onClick={handleStartScanner}
          className="mt-4 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 text-lg"
        >
          Iniciar Escáner
        </button>
      )}

      {message && (
        <div className={`mt-4 text-lg font-semibold p-4 rounded-md w-full max-w-md text-center ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
    </div>
  );
}