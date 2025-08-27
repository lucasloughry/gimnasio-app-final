import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function CheckinScanner() {
  const [message, setMessage] = useState('Haz clic en "Iniciar Escáner" para activar la cámara.');
  const scannerRef = useRef(null);

  useEffect(() => {
    // Esta función se encarga de crear y configurar el escáner
    const setupScanner = () => {
      // Evitar duplicar el escáner si ya existe
      if (scannerRef.current) {
        return;
      }
      
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader", // ID del div donde se renderizará el escáner
        { fps: 10, qrbox: { width: 250, height: 250 } }, // Configuración: 10 frames por segundo y un cuadro de escaneo
        false // verbose = false
      );

      qrScanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = qrScanner; // Guardamos la referencia al escáner
    };

    const onScanSuccess = (decodedText, decodedResult) => {
      // Esta función se llama cuando se lee un QR exitosamente
      setMessage('Escaneando...');
      handleCheckin(decodedText);
      if (scannerRef.current) {
        scannerRef.current.pause(); // Pausar la cámara para evitar múltiples escaneos
      }
    };

    const onScanFailure = (error) => {
      // No hacemos nada en caso de fallo (cuando no encuentra un QR)
    };

    // Llamamos a la función para configurar el escáner
    setupScanner();

    // Función de limpieza para cuando el componente se desmonte
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Fallo al limpiar el escáner.", error);
        });
        scannerRef.current = null;
      }
    };
  }, []); // El array vacío asegura que se ejecute solo una vez

  const handleCheckin = async (userId) => {
    try {
      const response = await axios.post('/api/attendance/checkin', { userId });
      setMessage(`✅ ¡Éxito! Check-in de ${response.data.userName} registrado.`);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || 'No se pudo registrar el check-in'}`);
    } finally {
      // Reactivar el escáner después de 3 segundos
      setTimeout(() => {
        setMessage('Apunta la cámara a un nuevo código QR.');
        if (scannerRef.current) {
          scannerRef.current.resume();
        }
      }, 3000);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Escaner de Check-in</h1>
      {/* Este div es donde la librería dibujará la cámara */}
      <div id="qr-reader" className="w-full max-w-md border-4 rounded-lg"></div>
      
      {message && (
        <div className={`mt-4 text-lg font-semibold p-4 rounded-md w-full max-w-md text-center ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
    </div>
  );
}