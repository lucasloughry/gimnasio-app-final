import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cuando la aplicación carga, intenta recuperar al usuario del localStorage
    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
      localStorage.removeItem('userInfo');
    }
  }, []);

  const login = (userData) => {
    // Guarda el objeto de usuario completo como un string en localStorage
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Limpia el usuario del localStorage y del estado
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};