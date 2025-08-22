import { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
import axios from 'axios';

export default function CheckinScanner() {
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null); // Reference to the <video> element
  const controlsRef = useRef(null); // Reference to the scanner controls

  const handleScan = async (result) => {
    if (result && isScanning) {
      setIsScanning(false); // Stop scanning immediately
      const userId = result.getText();
      try {
        const response = await axios.post('http://localhost:5000/api/attendance/checkin', {
          userId: userId,
        });
        setMessage(`✅ ¡Éxito! Check-in de ${response.data.userName} registrado.`);
      } catch (error) {
        setMessage(`❌ Error: ${error.response?.data?.message || 'No se pudo registrar el check-in'}`);
      }
    }
  };

  const startScanner = async () => {
    if (videoRef.current) {
      setIsScanning(true);
      setMessage('Apunta la cámara al código QR...');
      const codeReader = new BrowserQRCodeReader();
      try {
        // Start decoding from the video device
        const newControls = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result) {
            handleScan(result);
          }
          if (err && !(err instanceof DOMException && err.name === 'NotAllowedError')) {
            // Log other errors, but ignore permission denied
            console.error(err);
          }
        });
        controlsRef.current = newControls; // Save controls to stop it later
      } catch (err) {
        console.error("Failed to start scanner", err);
        setMessage("❌ Error: No se pudo iniciar la cámara. Revisa los permisos.");
        setIsScanning(false);
      }
    }
  };

  const stopScanner = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setIsScanning(false);
  };

  // Cleanup effect to stop the camera when the component is unmounted
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Escaner de Check-in</h1>
      <div className="w-full max-w-md bg-gray-200 rounded-lg overflow-hidden shadow-md">
        <video ref={videoRef} className="w-full" />
      </div>

      {!isScanning ? (
        <button
          onClick={startScanner}
          className="mt-4 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 text-lg"
        >
          Iniciar Escáner
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="mt-4 bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 text-lg"
        >
          Detener Escáner
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
