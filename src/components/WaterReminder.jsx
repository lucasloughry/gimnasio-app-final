import { useEffect, useRef, useState } from 'react';

const INTERVAL = 15 * 60 * 1000;
const BUTTON_SIZE = 56;

export default function WaterReminder() {
  const [active, setActive] = useState(() => localStorage.getItem('waterReminder') === 'active');
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [position, setPosition] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('waterReminderPosition')) || { x: window.innerWidth - 76, y: window.innerHeight - 92 };
    } catch {
      return { x: window.innerWidth - 76, y: window.innerHeight - 92 };
    }
  });
  const drag = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const remind = () => {
      setToast(true);
      window.setTimeout(() => setToast(false), 6000);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Hora de tomar agua 💧', { body: 'Una pausa corta para hidratarte.', icon: '/pwa-192x192.png' });
      }
    };
    const intervalId = window.setInterval(remind, INTERVAL);
    return () => window.clearInterval(intervalId);
  }, [active]);

  useEffect(() => {
    const keepOnScreen = () => setPosition(current => ({
      x: Math.min(Math.max(8, current.x), window.innerWidth - BUTTON_SIZE - 8),
      y: Math.min(Math.max(72, current.y), window.innerHeight - BUTTON_SIZE - 8),
    }));
    window.addEventListener('resize', keepOnScreen);
    keepOnScreen();
    return () => window.removeEventListener('resize', keepOnScreen);
  }, []);

  const toggle = async () => {
    if (!active && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
    setActive(current => {
      localStorage.setItem('waterReminder', current ? 'inactive' : 'active');
      return !current;
    });
  };

  const onPointerDown = event => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startY: event.clientY, originX: position.x, originY: position.y, moved: false };
  };
  const onPointerMove = event => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.startX;
    const dy = event.clientY - drag.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) drag.current.moved = true;
    setPosition({ x: Math.min(Math.max(8, drag.current.originX + dx), window.innerWidth - BUTTON_SIZE - 8), y: Math.min(Math.max(72, drag.current.originY + dy), window.innerHeight - BUTTON_SIZE - 8) });
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    if (!drag.current.moved) setOpen(current => !current);
    localStorage.setItem('waterReminderPosition', JSON.stringify(position));
    drag.current = null;
  };
  const panelPosition = `${position.y < 230 ? 'top-16' : 'bottom-16'} ${position.x < 280 ? 'left-0' : 'right-0'}`;

  return (
    <div className="fixed z-50 touch-none" style={{ left: position.x, top: position.y }}>
      {toast && <div className={`absolute ${panelPosition} w-60 rounded-2xl border border-cyan-200 bg-white p-4 text-sm text-slate-700 shadow-2xl dark:border-cyan-900 dark:bg-slate-900 dark:text-slate-200`}><strong className="block text-cyan-600">Hora de hidratarte 💧</strong>Tomate un vaso de agua.</div>}
      {open && <div className={`absolute ${panelPosition} w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900`}><p className="font-black">Recordatorio de agua</p><p className="mt-1 text-xs text-slate-500">Aviso cada 15 minutos mientras la app esté abierta.</p><button onClick={toggle} className={`mt-3 w-full rounded-xl px-4 py-2 text-sm font-bold ${active ? 'bg-red-100 text-red-700' : 'bg-cyan-500 text-slate-950'}`}>{active ? 'Desactivar' : 'Activar cada 15 min'}</button><p className="mt-2 text-center text-[11px] text-slate-400">Arrastrá la gota para moverla</p></div>}
      <button type="button" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} className={`grid h-14 w-14 select-none place-items-center rounded-2xl text-2xl shadow-xl transition ${active ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/20' : 'bg-slate-800 text-slate-300'}`} aria-label="Recordatorio de agua">💧</button>
    </div>
  );
}
