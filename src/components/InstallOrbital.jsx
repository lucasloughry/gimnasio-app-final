import { useEffect, useState } from 'react';

export default function InstallOrbital() {
  const [installPrompt,setInstallPrompt]=useState(null);
  const [installing,setInstalling]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    if(window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) return;
    const ready=event=>{event.preventDefault();setInstallPrompt(event);};
    const installed=()=>setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt',ready);
    window.addEventListener('appinstalled',installed);
    return ()=>{window.removeEventListener('beforeinstallprompt',ready);window.removeEventListener('appinstalled',installed);};
  },[]);
  if(!installPrompt&&!error)return null;
  const install=async()=>{
    setInstalling(true);
    setError('');
    try {await installPrompt.prompt();await installPrompt.userChoice;}
    catch {setError('Para instalar, abrí el menú de Chrome y elegí Agregar a pantalla principal → Instalar.');}
    finally {setInstallPrompt(null);setInstalling(false);}
  };
  return <aside className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center gap-3"><img src="/orbital-white-192.png" alt="" className="h-12 w-12 rounded-xl"/><div><p className="font-bold">Orbital en tu celular</p><p className="text-sm text-slate-500">Encontralo entre tus aplicaciones.</p></div></div>{installPrompt&&<button type="button" disabled={installing} onClick={install} className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">{installing?'Abriendo instalación…':'Instalar Orbital'}</button>}{error&&<p role="status" className="text-sm text-slate-500">{error}</p>}</aside>;
}
