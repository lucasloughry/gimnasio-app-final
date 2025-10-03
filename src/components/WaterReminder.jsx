import { useState, useEffect } from 'react';

export default function WaterReminder() {
  const [remindersActive, setRemindersActive] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  // 1. Efecto para pedir permiso al cargar el componente
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, []);

  // 2. Efecto que activa/desactiva el temporizador
  useEffect(() => {
    let intervalId;

    if (remindersActive && permission === 'granted') {
      // Si los recordatorios están activos y tenemos permiso,
      // creamos un temporizador que se ejecute cada hora.
      intervalId = setInterval(() => {
        new Notification('¡Hora de hidratarse! 💧', {
          body: 'Recuerda tomar un vaso de agua para mantenerte saludable.',
          icon: '/favicon.ico', // Puedes cambiar esto por el logo de tu app
        });
      }, 3600000); // 3600000 milisegundos = 1 hora
    }

    // 3. Función de limpieza: se ejecuta cuando el componente se "apaga"
    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Limpiamos el temporizador para no dejarlo corriendo
      }
    };
  }, [remindersActive, permission]); // Se vuelve a ejecutar si cambian estas variables

  const handleToggleReminders = () => {
    if (permission !== 'granted') {
      alert('Primero necesitas permitir las notificaciones en tu navegador.');
      Notification.requestPermission().then(setPermission);
    } else {
      setRemindersActive(!remindersActive);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
      <p className="font-semibold mb-2">Recordatorio de Agua</p>
      <button
        onClick={handleToggleReminders}
        className={`w-full py-2 px-4 rounded-md text-white font-bold ${
          remindersActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {remindersActive ? 'Desactivar' : 'Activar'}
      </button>
      {remindersActive && <p className="text-xs text-green-600 mt-2 text-center">Activado (cada 1 hora)</p>}
    </div>
  );
}
