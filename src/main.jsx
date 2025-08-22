// src/main.jsx - ACTUALIZADO

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext' // <-- 1. Importar el proveedor

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- 2. Envolver la App */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
