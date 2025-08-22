import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import machineRoutes from './routes/machineRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Middlewares (¡Esta parte es clave para el error de CORS!)
app.use(cors()); 
app.use(express.json());

// Servir archivos estáticos (imágenes)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas del API
app.get('/api', (req, res) => {
  res.send('API del Gimnasio funcionando...');
});
app.use('/api/machines', machineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);

// Exportar la app para Vercel
export default app;

// Iniciar el servidor solo si no estamos en un entorno serverless (como Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
}
