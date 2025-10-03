    import express from 'express';
    import { protect } from '../middleware/authMiddleware.js'; // Usaremos esto a futuro para proteger rutas
    import WorkoutTemplate from '../models/workoutTemplateModel.js';
    
    const router = express.Router();
    
    // --- RUTA PARA CREAR UNA NUEVA PLANTILLA DE RUTINA ---
    // POST /api/templates
    router.post('/', async (req, res) => {
      try {
        const { name, category, exercises } = req.body;
        const newTemplate = await WorkoutTemplate.create({ name, category, exercises });
        res.status(201).json(newTemplate);
      } catch (error) {
        res.status(400).json({ message: 'Error al crear la plantilla', error });
      }
    });
    
    // --- RUTA PARA OBTENER TODAS LAS PLANTILLAS DE RUTINA ---
    // GET /api/templates
    router.get('/', async (req, res) => {
      try {
        const templates = await WorkoutTemplate.find({}).lean(); // Añadimos .lean() por buena práctica
        res.json(templates);
      } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
      }
    });
    
    export default router;
    