import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import WorkoutLog from '../models/workoutLogModel.js';

const router = express.Router();

// --- RUTA PARA OBTENER TODOS LOS ENTRENAMIENTOS DE UN USUARIO ---
router.get('/', protect, async (req, res) => {
  try {
    const workouts = await WorkoutLog.find({ user: req.user.id }).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA PARA CREAR UN NUEVO REGISTRO DE ENTRENAMIENTO (ACTUALIZADA) ---
router.post('/', protect, async (req, res) => {
  try {
    // Ahora también recibimos 'duration' desde el body
    const { name, duration, exercises } = req.body;

    if (!name || !duration || !exercises) {
      return res.status(400).json({ message: 'Faltan datos en el formulario.' });
    }

    const newWorkout = new WorkoutLog({
      user: req.user.id,
      name,
      duration, // <-- Guardamos la duración
      exercises,
    });

    const savedWorkout = await newWorkout.save();
    res.status(201).json(savedWorkout);
  } catch (error) {
    console.error("Error saving workout:", error);
    res.status(400).json({ message: 'Error al guardar el entrenamiento', error });
  }
});

// --- RUTA PARA OBTENER EL PROGRESO DE UN EJERCICIO ESPECÍFICO ---
router.get('/progress/:exerciseName', protect, async (req, res) => {
  try {
    const exerciseName = req.params.exerciseName;
    const workouts = await WorkoutLog.find({ user: req.user.id }).sort({ date: 'asc' });
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