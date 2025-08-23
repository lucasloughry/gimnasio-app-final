import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Machine from '../models/machineModel.js';

const router = express.Router();

// Configurar Cloudinary con tus claves del archivo .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar el almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gimnasio-maquinas', // Nombre de la carpeta en Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});

const upload = multer({ storage });

// --- RUTAS ACTUALIZADAS ---

// GET todas las máquinas
router.get('/', async (req, res) => {
  try {
    const machines = await Machine.find({}).lean();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// GET máquina por ID
router.get('/:id', async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id).lean();
    if (machine) {
      res.json(machine);
    } else {
      res.status(404).json({ message: 'Máquina no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST para CREAR una máquina (ahora sube la imagen a Cloudinary)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    // req.file.path ahora es la URL segura de Cloudinary
    const image = req.file ? req.file.path : ''; 

    const newMachine = await Machine.create({ name, description, image, exercises: [] });
    res.status(201).json(newMachine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST para AÑADIR un ejercicio (ahora sube el GIF a Cloudinary)
router.post('/:id/exercises', upload.single('gif'), async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (machine) {
      const { name } = req.body;
      const gifUrl = req.file ? req.file.path : ''; // La URL del GIF desde Cloudinary

      const newExercise = { name, gifUrl };
      machine.exercises.push(newExercise);
      await machine.save();
      res.status(201).json(machine);
    } else {
      res.status(404).json({ message: 'Máquina no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// DELETE para BORRAR un ejercicio
router.delete('/:machineId/exercises/:exerciseId', async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.machineId);
    if (machine) {
      machine.exercises = machine.exercises.filter(
        (ex) => ex._id.toString() !== req.params.exerciseId
      );
      await machine.save();
      res.json({ message: 'Ejercicio eliminado', machine });
    } else {
      res.status(404).json({ message: 'Máquina no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;