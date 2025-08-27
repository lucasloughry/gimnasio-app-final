import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function CheckinScanner() {
  // Cambiamos el mensaje inicial para que sea más claro
  const [message, setMessage] = useState('La cámara se activará al conceder los permisos.');
  const scannerRef = useRef(null);

  useEffect(() => {
    const setupScanner = () => {
      if (scannerRef.current) return;
      
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      qrScanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = qrScanner;
    };

    const onScanSuccess = (decodedText, decodedResult) => {
      setMessage('Procesando check-in...');
      handleCheckin(decodedText);
      if (scannerRef.current) scannerRef.current.pause();
    };

    const onScanFailure = (error) => {
      // No hacemos nada en caso de fallo (cuando no encuentra un QR)
    };

    setupScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Fallo al limpiar el escáner.", error);
        });
        scannerRef.current = null;
      }
    };
  }, []);

  const handleCheckin = async (userId) => {
    try {
      const response = await axios.post('/api/attendance/checkin', { userId });
      setMessage(`✅ ¡Éxito! Check-in de ${response.data.userName} registrado.`);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || 'No se pudo registrar el check-in'}`);
    } finally {
      setTimeout(() => {
        setMessage('Listo para el siguiente escaneo.');
        if (scannerRef.current) scannerRef.current.resume();
      }, 3000);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Escaner de Check-in</h1>
      <div id="qr-reader" className="w-full max-w-md border-4 rounded-lg"></div>
      
      {message && (
        <div className={`mt-4 text-lg font-semibold p-4 rounded-md w-full max-w-md text-center ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
    </div>
  );
}