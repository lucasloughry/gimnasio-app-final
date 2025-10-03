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

// GET /api/workouts/progress/:exerciseName
router.get('/progress/:exerciseName', protect, async (req, res) => {
  try {
    const exerciseName = req.params.exerciseName;

    // 1. Buscamos todos los entrenamientos del usuario
    const workouts = await WorkoutLog.find({ user: req.user.id }).sort({ date: 'asc' });

    // 2. Filtramos y extraemos los datos solo para el ejercicio solicitado
    const progressData = workouts.flatMap(workout => 
      workout.exercises
        .filter(ex => ex.name === exerciseName)
        .map(ex => ({
          date: workout.date,
          weight: ex.weight
        }))
    );

    res.json(progressData);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;