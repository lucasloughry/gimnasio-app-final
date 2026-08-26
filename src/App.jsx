import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Maquina from "./pages/Maquina";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin/Dashboard";
import AdminRoute from "./components/AdminRoute";
import { useAuth } from "./context/AuthContext";
import Profile from "./pages/Profile";
import CheckinScanner from "./pages/admin/CheckinScanner";
import AddMachine from "./pages/admin/AddMachine";
import ManageMachines from "./pages/admin/ManageMachines";
import EditMachine from "./pages/admin/EditMachine";
import AttendanceLog from "./pages/admin/AttendanceLog";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import LogWorkout from "./pages/LogWorkout";
import MyWorkouts from "./pages/MyWorkouts";
import ManageWorkoutTemplates from "./pages/admin/ManageWorkoutTemplates";
import WaterReminder from "./components/WaterReminder";

export default function App() {
  const { user, logout } = useAuth();
  // 1. Nuevo estado para controlar si el menú móvil está abierto o cerrado
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div>
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/95 px-4 py-3 text-white shadow-lg backdrop-blur sm:px-6">
        <Link to="/" className="flex items-center gap-3 font-black tracking-tight" onClick={() => setIsMenuOpen(false)}><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 text-slate-950">G</span><span>Gimnasio <span className="text-emerald-400">Municipal</span></span></Link>
        
        {/* --- Menú para pantallas grandes (Desktop) --- */}
        <div className="hidden md:flex space-x-4 items-center">
          <button onClick={() => setIsDark(theme => !theme)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg transition hover:bg-white/10" aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'} title={isDark ? 'Modo claro' : 'Modo oscuro'}>{isDark ? '☀️' : '🌙'}</button>
          {user ? (
            <>
              <Link to="/my-workouts" className="font-semibold text-slate-300 transition hover:text-white">Mi progreso</Link>
              <Link to="/log-workout" className="rounded-xl bg-emerald-400 px-4 py-2 font-bold text-slate-950 transition hover:bg-emerald-300">+ Entrenar</Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="font-semibold hover:underline">Panel Admin</Link>
              )}
              <Link to="/profile" className="font-semibold hover:underline">Hola, {user.name}</Link>
              <button onClick={logout} className="font-semibold text-slate-400 hover:text-red-400">Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="bg-white text-blue-600 font-semibold py-2 px-3 rounded hover:bg-gray-200">Registrarse</Link>
            </>
          )}
        </div>

        {/* --- Botón de Hamburguesa para pantallas pequeñas (Móvil) --- */}
        <div className="md:hidden">
          <button aria-label="Abrir menú" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-xl border border-white/10 p-2">
            {/* Ícono de hamburguesa (tres líneas) */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>

        {/* --- Menú desplegable para Móvil --- */}
        {isMenuOpen && (
          <div className="absolute left-0 top-full z-10 w-full border-t border-white/10 bg-slate-950 shadow-2xl md:hidden">
            <div className="flex flex-col items-stretch space-y-2 p-4 text-center">
              <button onClick={() => setIsDark(theme => !theme)} className="rounded-xl border border-white/10 p-3 font-semibold text-slate-300">{isDark ? '☀️ Usar modo claro' : '🌙 Usar modo oscuro'}</button>
              {user ? (
                <>
                  <Link to="/my-workouts" className="font-semibold hover:underline" onClick={() => setIsMenuOpen(false)}>Mi Progreso</Link>
                  <Link to="/log-workout" className="rounded-xl bg-emerald-400 p-3 font-bold text-slate-950" onClick={() => setIsMenuOpen(false)}>+ Registrar entrenamiento</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="font-semibold hover:underline" onClick={() => setIsMenuOpen(false)}>Panel Admin</Link>
                  )}
                  <Link to="/profile" className="font-semibold hover:underline" onClick={() => setIsMenuOpen(false)}>Hola, {user.name}</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full p-3 font-semibold text-red-400">Cerrar sesión</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:underline" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="w-full text-center bg-white text-blue-600 font-semibold py-2 px-3 rounded hover:bg-gray-200" onClick={() => setIsMenuOpen(false)}>Registrarse</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
        <Routes>
          {/* ... (el resto de tus rutas no cambia) ... */}
          <Route path="/" element={<Home />} />
          <Route path="/maquina/:id" element={<Maquina />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/log-workout" element={<LogWorkout />} />
          <Route path="/my-workouts" element={<MyWorkouts />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/checkin" element={<CheckinScanner />} /> 
            <Route path="/admin/add-machine" element={<AddMachine />} /> 
            <Route path="/admin/machines" element={<ManageMachines />} />
            <Route path="/admin/machine/edit/:id" element={<EditMachine />} />
            <Route path="/admin/attendance" element={<AttendanceLog />} />
            <Route path="/admin/templates" element={<ManageWorkoutTemplates />} />
          </Route>
        </Routes>
      </main>

      {user && <WaterReminder />}
    </div>
  );
}

