import { useState } from "react";
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

  return (
    <div>
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md relative">
        <Link to="/" className="font-bold text-lg" onClick={() => setIsMenuOpen(false)}>🏋️ Gimnasio Municipal</Link>
        
        {/* --- Menú para pantallas grandes (Desktop) --- */}
        <div className="hidden md:flex space-x-4 items-center">
          {user ? (
            <>
              <Link to="/my-workouts" className="font-semibold hover:underline">Mi Progreso</Link>
              <Link to="/log-workout" className="font-semibold hover:underline">Registrar Entrenamiento</Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="font-semibold hover:underline">Panel Admin</Link>
              )}
              <Link to="/profile" className="font-semibold hover:underline">Hola, {user.name}</Link>
              <button onClick={logout} className="bg-red-500 font-semibold py-2 px-3 rounded hover:bg-red-600">Logout</button>
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
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {/* Ícono de hamburguesa (tres líneas) */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>

        {/* --- Menú desplegable para Móvil --- */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-blue-600 md:hidden z-10">
            <div className="flex flex-col items-center p-4 space-y-4">
              {user ? (
                <>
                  <Link to="/my-workouts" className="font-semibold hover:underline" onClick={() => setIsMenuOpen(false)}>Mi Progreso</Link>
                  <Link to="/log-workout" className="font-semibold hover:underline" onClick={() => setIsMenuOpen(false)}>Registrar Entrenamiento</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="font-semibold hover:underline" onClick={() => setIsMenuOpen(false)}>Panel Admin</Link>
                  )}
                  <Link to="/profile" className="font-semibold hover:underline" onClick={() => setIsMenuOpen(false)}>Hola, {user.name}</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full bg-red-500 font-semibold py-2 px-3 rounded hover:bg-red-600">Logout</button>
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

      <main className="bg-gray-50 min-h-screen">
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

