import express from 'express';
import Attendance from '../models/attendanceModel.js';
import User from '../models/userModel.js';

const router = express.Router();

// --- RUTA NUEVA PARA OBTENER LOS REGISTROS DE ASISTENCIA ---
router.get('/', async (req, res) => {
  try {
    const attendances = await Attendance.find({}) // Busca todos los registros
      .populate('user', 'name') // Cruza la data con la colección 'User' y solo trae el campo 'name'
      .sort({ checkinTime: -1 }); // Ordena por fecha, los más recientes primero
    
    res.json(attendances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// RUTA PARA REGISTRAR UN CHECK-IN (ya la teníamos)
router.post('/checkin', async (req, res) => {
  // ... (el código de esta ruta se queda igual)
});

export default router;