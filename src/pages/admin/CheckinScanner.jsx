import { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

export default function CheckinScanner() {
  const [message, setMessage] = useState('');
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // Esta función de limpieza se asegura de que la cámara se apague
    // si navegas a otra página.
    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => console.error("Fallo al detener el escáner.", err));
      }
    };
  }, [scanner]);

  const handleStartScanner = () => {
    setMessage('Iniciando cámara...');
    const html5QrCode = new Html5Qrcode("qr-reader");
    setScanner(html5QrCode);

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      handleCheckin(decodedText);
      html5QrCode.stop().catch(err => console.error("Fallo al detener el escáner.", err));
      setScanner(null);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    // Inicia la cámara. El último parámetro `false` es para no usar la cámara trasera.
    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
      .catch(err => {
        setMessage("❌ Error: No se pudo iniciar la cámara.");
        console.error("Error al iniciar la cámara", err);
      });
  };

  const handleCheckin = async (userId) => {
    setMessage('Procesando check-in...');
    try {
      const response = await axios.post('/api/attendance/checkin', { userId });
      setMessage(`✅ ¡Éxito! Check-in de ${response.data.userName} registrado.`);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || 'No se pudo registrar el check-in'}`);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Escaner de Check-in</h1>
      
      {/* Este div es donde la librería dibujará la cámara */}
      <div id="qr-reader" className="w-full max-w-md border-4 rounded-lg bg-gray-100 min-h-[300px]"></div>
      
      {/* Mostramos el botón solo si el escáner no está activo */}
      {!scanner && (
        <button 
          onClick={handleStartScanner}
          className="mt-4 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 text-lg"
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