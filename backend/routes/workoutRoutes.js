import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import WorkoutLog from '../models/workoutLogModel.js';

const router = express.Router();

// --- RUTA PARA OBTENER TODOS LOS ENTRENAMIENTOS DE UN USUARIO ---
// GET /api/workouts
router.get('/', protect, async (req, res) => {
  try {
    const workouts = await WorkoutLog.find({ user: req.user.id }).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA PARA CREAR UN NUEVO REGISTRO DE ENTRENAMIENTO ---
// POST /api/workouts
router.post('/', protect, async (req, res) => {
  try {
    const { name, exercises } = req.body;

    const newWorkout = new WorkoutLog({
      user: req.user.id,
      name,
      exercises,
    });

    const savedWorkout = await newWorkout.save();
    res.status(201).json(savedWorkout);
  } catch (error) {
    res.status(400).json({ message: 'Error al guardar el entrenamiento', error });
  }
});

export default router;