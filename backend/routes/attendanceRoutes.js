import express from 'express';
import Attendance from '../models/attendanceModel.js';
import User from '../models/userModel.js';

const router = express.Router();

// RUTA PARA REGISTRAR UN CHECK-IN
// POST /api/attendance/checkin
router.post('/checkin', async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await Attendance.create({
      user: userId,
    });

    res.status(201).json({
      message: 'Check-in registrado exitosamente',
      userName: user.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// The change is on this line
export default router;