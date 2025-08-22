import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { user } = useAuth();

  // Si el usuario está logueado y su rol es 'admin', le damos acceso.
  // <Outlet /> renderiza el componente hijo de esta ruta (el Dashboard).
  if (user && user.role === 'admin') {
    return <Outlet />;
  }

  // Si no, lo redirigimos a la página de inicio.
  return <Navigate to="/" replace />;
}