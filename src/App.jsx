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
import MyWorkouts from "./pages/MyWorkouts"; // <-- 1. IMPORTACIÓN NUEVA
import ManageWorkoutTemplates from "./pages/admin/ManageWorkoutTemplates";

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-lg">🏋️ Gimnasio Municipal</Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            <>
              {/* --- ENLACES NUEVOS PARA EL USUARIO --- */}
              <Link to="/my-workouts" className="font-semibold hover:underline">
                Mis Entrenamientos
              </Link>
              <Link to="/log-workout" className="font-semibold hover:underline">
                Registrar Entrenamiento
              </Link>
              
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="font-semibold hover:underline">
                  Panel Admin
                </Link>
              )}
              <Link to="/profile" className="font-semibold hover:underline">
                Hola, {user.name}
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 font-semibold py-2 px-3 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="bg-white text-blue-600 font-semibold py-2 px-3 rounded hover:bg-gray-200">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      <main>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/maquina/:id" element={<Maquina />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Rutas para usuarios logueados */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/log-workout" element={<LogWorkout />} /> 
          <Route path="/my-workouts" element={<MyWorkouts />} /> {/* <-- 2. RUTA NUEVA */}

          {/* Rutas Protegidas para Admins */}
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
    </div>
  )
}
