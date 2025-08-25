import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function Maquina() {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        // Usando ruta relativa
        const response = await axios.get(`/api/machines/${id}`);
        setMachine(response.data);
      } catch (error) {
        console.error("Error al obtener la máquina:", error);
      }
    };
    fetchMachine();
  }, [id]);

  if (!machine) {
    return <p className="p-4">Cargando...</p>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {machine.image && (
        <img 
          // Usando ruta relativa para la imagen
          src={m.image}
          alt={machine.name} 
          className="w-full h-80 object-cover rounded-lg mb-6 shadow-lg"
        />
      )}
      <h1 className="text-3xl font-bold mb-4">{machine.name}</h1>
      <p className="mb-6 text-gray-700">{machine.description}</p>
      
      <h2 className="text-2xl font-semibold mb-3">Ejercicios recomendados:</h2>
      
      <ul className="space-y-4">
        {machine.exercises && machine.exercises.length > 0 ? (
          machine.exercises.map((ej, idx) => (
            <li key={idx} className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm">
              <img 
                // Usando ruta relativa para el GIF
                src={`/${ej.gifUrl.replace(/\\/g, '/')}`} 
                alt={ej.name}
                className="w-20 h-20 object-cover rounded-md mr-4 bg-gray-200"
              />
              <span className="font-medium text-lg">{ej.name}</span>
            </li>
          ))
        ) : (
          <p>No hay ejercicios definidos para esta máquina.</p>
        )}
      </ul>
      <Link to="/" className="text-blue-500 mt-6 inline-block">← Volver</Link>
    </div>
  );
}
