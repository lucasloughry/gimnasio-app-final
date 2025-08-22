import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Creamos el Contexto (el tablero de anuncios)
const AuthContext = createContext(null);

// 2. Creamos el "Proveedor" del Contexto.
// Este componente envolverá nuestra aplicación y gestionará los datos.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // useEffect para comprobar si hay un token en localStorage cuando la app carga
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    // Si hay token, podríamos decodificarlo para obtener los datos del usuario.
    // Por ahora, solo guardaremos el token para saber si está autenticado.
    if (token) {
      setUser({ token });
    }
  }, []);

  // Función para manejar el login
  const login = (userData) => {
    localStorage.setItem('userToken', userData.token);
    setUser(userData);
  };

  // Función para manejar el logout
  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
  };

  // El valor que proveeremos a todos los componentes hijos
  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Creamos un "hook" personalizado para usar nuestro contexto más fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};