import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import QRCode from 'react-qr-code';
import axios from 'axios';

export default function Profile() {
  const { user, login } = useAuth(); // Usamos 'login' para actualizar el contexto con la nueva foto
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Por favor, selecciona un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    
    try {
      // Necesitamos enviar el token de autenticación para que el backend sepa quiénes somos
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        throw new Error("Usuario no autenticado.");
      }
      const token = userInfo.token;
      
      const response = await axios.post('/api/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      // El backend nos devuelve el usuario actualizado.
      // Lo usamos para actualizar nuestro contexto y localStorage.
      login(response.data);
      
      setMessage('¡Foto de perfil actualizada con éxito!');
      setFile(null);
      e.target.reset();

    } catch (error) {
      setMessage('Error al subir la foto.');
      console.error(error);
    }
  };

  if (!user) {
    return <p className="p-4">Cargando perfil...</p>;
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Tu Perfil</h1>
      
      {/* Mostramos la foto de perfil actual o una por defecto */}
      <img 
        src={user.profilePicture || `https://via.placeholder.com/150`} 
        alt="Foto de perfil"
        className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-white shadow-lg"
      />
      <p className="text-xl mb-6">Hola, <span className="font-semibold">{user.name}</span></p>

      <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna del QR */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-4">Tu QR de acceso</h2>
          {user._id ? (
            <div style={{ background: 'white', padding: '16px' }}>
                <QRCode value={user._id} size={180} />
            </div>
          ) : <p>Generando QR...</p>}
        </div>

        {/* Columna para subir foto */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Cambiar Foto de Perfil</h2>
          <form onSubmit={handleUpload} className="w-full space-y-4 flex flex-col flex-grow">
            <div className="flex-grow">
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Selecciona una imagen:</label>
              <input 
                type="file" 
                id="file-upload"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={!file}
            >
              Subir Foto
            </button>
            {message && <p className="text-center text-sm mt-2">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}