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
    const { name, duration, exercises, muscleGroup } = req.body;

    if (!name?.trim() || !Number.isFinite(duration) || duration<=0 || !Array.isArray(exercises) || !exercises.length) {
      return res.status(400).json({ message: 'Faltan datos en el formulario.' });
    }

    for (const ex of exercises) {
      if (!ex.name?.trim() || (ex.series !== undefined && (!Array.isArray(ex.series) || !ex.series.length || ex.series.length>100 || ex.series.some(s=>typeof s.weight!=='number' || !Number.isFinite(s.weight) || s.weight<0 || !Number.isInteger(s.reps) || s.reps<1 || (s.rir!=null && (!Number.isInteger(s.rir) || s.rir<0 || s.rir>10)))))) return res.status(400).json({message:'Revisá peso, repeticiones y RIR de cada serie.'});
      if (ex.series?.length) { ex.sets=ex.series.length; ex.reps=ex.series[0].reps; ex.weight=ex.series[0].weight; }
      if (!Number.isInteger(ex.sets) || ex.sets<1 || !Number.isInteger(ex.reps) || ex.reps<1 || !Number.isFinite(ex.weight) || ex.weight<0) return res.status(400).json({message:'Datos de ejercicio inválidos.'});
    }
    const newWorkout = new WorkoutLog({
      user: req.user.id,
      name,
      muscleGroup,
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
          weight: ex.series?.length ? Math.max(...ex.series.map(s=>s.weight)) : ex.weight,
          reps: ex.series?.length ? ex.series.reduce((best,s)=>s.weight>best.weight?s:best,ex.series[0]).reps : ex.reps,
          series:ex.series, equipment:ex.equipment, unilateral:ex.unilateral,
          sets: ex.sets,
        }))
    );
    res.json(progressData);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;
