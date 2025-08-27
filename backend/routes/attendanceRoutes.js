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
  try {
    const { userId } = req.body;

    // AÑADE .lean() AQUÍ
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await Attendance.create({ user: userId });

    // Ahora podemos mostrar la foto en el futuro
    res.status(201).json({
      message: 'Check-in registrado exitosamente',
      userName: user.name,
      userPicture: user.profilePicture // Enviamos también la foto
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
export default router;