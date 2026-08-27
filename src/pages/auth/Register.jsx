import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import GoogleSignIn from '../../components/GoogleSignIn';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Usando la ruta relativa, que funciona en local y en producción
      await axios.post('/api/users/register', {
        name,
        email,
        password,
      });
      
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login'); // Redirigir al login después de un registro exitoso

    } catch (error) {
      const message = error.response?.data?.message || 'Hubo un error en el registro.';
      console.error('Error en el registro:', message);
      alert(message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white p-8 shadow-2xl dark:bg-slate-900">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">Empezá hoy</p><h1 className="mt-2 text-3xl font-black">Crear cuenta</h1></div>
        <GoogleSignIn />
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />o con email<span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
              placeholder="Tu Nombre"
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength="8"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white hover:bg-slate-800 dark:bg-emerald-400 dark:text-slate-950"
          >
            Registrarse
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
