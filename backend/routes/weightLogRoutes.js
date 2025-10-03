import express from 'express';
    import { protect } from '../middleware/authMiddleware.js';
    import WeightLog from '../models/weightLogModel.js';
    
    const router = express.Router();
    
    // --- RUTA PARA OBTENER EL HISTORIAL DE PESO DE UN USUARIO ---
    // GET /api/weight
    router.get('/', protect, async (req, res) => {
      try {
        const weightHistory = await WeightLog.find({ user: req.user.id }).sort({ date: 'asc' });
        res.json(weightHistory);
      } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
      }
    });
    
    // --- RUTA PARA AÑADIR UN NUEVO REGISTRO DE PESO ---
    // POST /api/weight
    router.post('/', protect, async (req, res) => {
      try {
        const { weight } = req.body;
    
        if (!weight) {
          return res.status(400).json({ message: 'El peso es un campo requerido.' });
        }
    
        const newWeightLog = new WeightLog({
          user: req.user.id,
          weight,
        });
    
        const savedLog = await newWeightLog.save();
        res.status(201).json(savedLog);
      } catch (error) {
        res.status(400).json({ message: 'Error al guardar el registro de peso', error });
      }
    });
    
    export default router;
    
