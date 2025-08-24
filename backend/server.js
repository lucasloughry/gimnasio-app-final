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

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- INSTRUCCIÓN CLAVE PARA SERVIR IMÁGENES ---
// Esta línea debe estar ANTES de las rutas del API.
// Le dice a Express que cualquier petición a /uploads, la busque en la carpeta física /uploads.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rutas del API ---
app.use('/api/machines', machineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);

// Exportar la app para Vercel
export default app;