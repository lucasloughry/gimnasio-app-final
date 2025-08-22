import path from 'path';
import express from 'express';
import multer from 'multer';
import Machine from '../models/machineModel.js';

const router = express.Router();

// --- Multer Configurations ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `machine-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

const exerciseStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/gifs/'),
  filename: (req, file, cb) => cb(null, `exercise-${Date.now()}${path.extname(file.originalname)}`),
});
const uploadGif = multer({ storage: exerciseStorage });


// --- ROUTES ---

// GET all machines
router.get('/', async (req, res) => {
  try {
    const machines = await Machine.find({}).lean(); // Ensure .lean() is here
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET machine by ID
router.get('/:id', async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id).lean(); // Ensure .lean() is here
    if (machine) {
      res.json(machine);
    } else {
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST create a new machine
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file ? req.file.path.replace(/\\/g, "/") : '';
    const newMachine = await Machine.create({ name, description, image, exercises: [] });
    res.status(201).json(newMachine);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST add an exercise to a machine
router.post('/:id/exercises', uploadGif.single('gif'), async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (machine) {
      const { name } = req.body;
      const gifUrl = req.file ? req.file.path.replace(/\\/g, "/") : '';
      const newExercise = { name, gifUrl };
      machine.exercises.push(newExercise);
      await machine.save();
      res.status(201).json(machine);
    } else {
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE an exercise from a machine
router.delete('/:machineId/exercises/:exerciseId', async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.machineId);
    if (machine) {
      machine.exercises = machine.exercises.filter(ex => ex._id.toString() !== req.params.exerciseId);
      await machine.save();
      res.json({ message: 'Exercise deleted', machine });
    } else {
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;