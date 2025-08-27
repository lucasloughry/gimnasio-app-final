import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

export default function CheckinScanner() {
  const [message, setMessage] = useState('');
  const [scannedUser, setScannedUser] = useState(null);
  const scannerRef = useRef(null);

  const startScanner = () => {
    setMessage('Iniciando cámara...');
    
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Fallo al detener el escáner.", err));
      }
      handleCheckin(decodedText);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
      .catch(err => {
        setMessage("❌ Error: No se pudo iniciar la cámara.");
        console.error("Error al iniciar la cámara", err);
      });
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Fallo al detener el escáner.", err));
      }
    };
  }, []);

  const handleCheckin = async (userId) => {
    setMessage('Procesando check-in...');
    try {
      const response = await axios.post('/api/attendance/checkin', { userId });
      setMessage(`✅ ¡Éxito! Check-in registrado.`);
      setScannedUser({ name: response.data.userName, picture: response.data.userPicture });
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || 'No se pudo registrar el check-in'}`);
    } finally {
      setTimeout(() => {
        setMessage('');
        setScannedUser(null);
      }, 3000); // Muestra la info por 3 segundos
    }
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Escaner de Check-in</h1>
      
      {scannedUser ? (
        <div className="w-full max-w-md flex flex-col items-center bg-white p-6 rounded-lg shadow-lg">
          <img 
            src={scannedUser.picture || `https://via.placeholder.com/150`} 
            alt="Foto de perfil"
            className="w-40 h-40 rounded-full object-cover mb-4 border-4 border-green-500"
          />
          <p className="text-2xl font-bold">{scannedUser.name}</p>
        </div>
      ) : (
        <>
          <div id="qr-reader" className="w-full max-w-md border-4 rounded-lg bg-gray-100 min-h-[300px]"></div>
          <button 
            onClick={startScanner}
            className="mt-4 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 text-lg"
          >
            Iniciar Escáner
          </button>
        </>
      )}

      {message && (
        <div className={`mt-4 text-lg font-semibold p-4 rounded-md w-full max-w-md text-center ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
    </div>
  );
}