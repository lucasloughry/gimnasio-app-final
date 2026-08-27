import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SCRIPT_ID = 'google-identity-services';

export default function GoogleSignIn() {
  const buttonRef = useRef(null);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Falta configurar el acceso con Google.');
      return undefined;
    }

    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async response => {
          try {
            setError('');
            const result = await axios.post('/api/users/google', { credential: response.credential });
            login(result.data);
            navigate('/');
          } catch (requestError) {
            setError(requestError.response?.data?.message || 'No pudimos ingresar con Google.');
          }
        },
      });
      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', shape: 'pill', width: Math.min(340, buttonRef.current.offsetWidth || 340), text: 'continue_with' });
    };

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      if (window.google) renderButton(); else existing.addEventListener('load', renderButton, { once: true });
      return undefined;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () => setError('No pudimos cargar el acceso con Google.');
    document.head.appendChild(script);
    return undefined;
  }, [login, navigate]);

  return <div><div ref={buttonRef} className="flex min-h-11 justify-center" />{error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}</div>;
}
