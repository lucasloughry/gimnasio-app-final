import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import GoogleSignIn from '../../components/GoogleSignIn';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Nuevo estado para el mensaje de error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/users/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      
      login(response.data);
      navigate('/');

    } catch (err) {
      const message = err.response?.data?.message || (err.request
        ? 'No pudimos conectar con el servidor. Probá nuevamente en unos segundos.'
        : 'No pudimos iniciar sesión.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-950 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-emerald-400 to-teal-600 px-8 py-10 text-slate-950">
          <p className="text-sm font-bold uppercase tracking-[0.22em]">Gimnasio Municipal</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Volvé a entrenar.</h1>
          <p className="mt-2 text-sm font-medium text-slate-900/70">Tu progreso te está esperando.</p>
        </div>
        <div className="space-y-5 p-8">
        <h2 className="text-2xl font-bold text-slate-900">Iniciar sesión</h2>
        <GoogleSignIn />
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />o con email<span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- MENSAJE DE ERROR DINÁMICO --- */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              <span className="block sm:inline">{error}. </span>
              <Link to="/forgot-password" className="font-bold underline hover:text-red-900">
                ¿Quieres restablecerla?
              </Link>
            </div>
          )}

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
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Conectando…' : 'Entrar'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Regístrate
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
