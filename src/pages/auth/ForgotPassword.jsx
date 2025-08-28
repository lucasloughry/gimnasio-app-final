import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Procesando...');
    try {
      const response = await axios.post('/api/users/forgot-password', { email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error al intentar enviar el correo.');
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Recuperar Contraseña</h1>
        <p className="text-center text-sm text-gray-600">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Enviar Enlace
          </button>
        </form>
        {message && <p className="text-center text-sm text-green-600 mt-4">{message}</p>}
        <div className="text-center mt-4">
          <Link to="/login" className="font-medium text-blue-600 hover:underline">Volver a Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
}