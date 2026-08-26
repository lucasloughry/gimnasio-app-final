import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import machineRoutes from './routes/machineRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import workoutTemplateRoutes from './routes/workoutTemplateRoutes.js'; // <-- 1. IMPORTACIÓN NUEVA
import weightLogRoutes from './routes/weightLogRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// En serverless la conexión puede enfriarse entre invocaciones. Este middleware
// garantiza que Mongo esté disponible y devuelve un error útil si falta configurar.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503).json({ message: 'La base de datos no está disponible en este momento.' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas del API (descomentadas)
app.use('/api/machines', machineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/templates', workoutTemplateRoutes); // <-- 2. RUTA NUEVA
app.use('/api/weight', weightLogRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Iniciar el servidor para desarrollo local
const PORT = process.env.PORT || 5001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
}

// Exportar la app para que Vercel la use
export default app;
