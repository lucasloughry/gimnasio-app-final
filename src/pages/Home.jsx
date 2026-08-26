import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TodayWorkout from '../components/TodayWorkout';

export default function Home() { 
  const [machines, setMachines] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const [machinesResponse, templatesResponse] = await Promise.all([
          axios.get('/api/machines'),
          axios.get('/api/templates'),
        ]);
        setMachines(machinesResponse.data);
        setTemplates(templatesResponse.data);
      } catch (error) {
        console.error("Error al obtener las máquinas:", error);
        setError('No pudimos cargar las máquinas. Intentá nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMachines();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-400 p-7 text-slate-950 sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.2em]">Tu gimnasio</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">Entrená con intención. Medí cada avance.</h1>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/log-workout" className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Empezar entrenamiento</Link>
          <Link to="/my-workouts" className="rounded-xl bg-white/60 px-5 py-3 font-bold">Ver mi progreso</Link>
        </div>
      </section>
      <TodayWorkout templates={templates} isLoading={isLoading} />
      <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Equipamiento</p><h2 className="mt-1 text-2xl font-black">Máquinas disponibles</h2></div><span className="text-sm text-slate-500">{machines.length} máquinas</span></div>
      {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      {isLoading && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(item => <div key={item} className="h-80 animate-pulse rounded-3xl bg-slate-200" />)}</div>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(machines) && machines.map(m => (
          <article key={m._id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {m.image && (
              <img 
                src={m.image} 
                alt={m.name} 
                className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
              />
            )}
            <div className="flex flex-1 flex-col p-5"><h3 className="text-xl font-black">{m.name}</h3>
            <p className="mt-2 line-clamp-2 flex-grow text-sm leading-6 text-slate-500">{m.description}</p>
            <Link
              to={`/maquina/${m._id}`}
              className="mt-5 inline-block self-start font-bold text-emerald-700"
            >
              Ver más →
            </Link>
            </div></article>
        ))}
      </div>
    </div>
  );
}
