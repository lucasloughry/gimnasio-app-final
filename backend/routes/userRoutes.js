import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import User from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js'; // Importamos el guardián

const router = express.Router();

// Configuración de Cloudinary (debe estar antes de las rutas que la usan)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar el almacenamiento en Cloudinary para fotos de perfil
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gimnasio-perfiles', // Carpeta en Cloudinary para fotos de perfil
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage });


// --- RUTAS PÚBLICAS ---
router.post('/register', async (req, res) => { /* ...código existente... */ });
router.post('/login', async (req, res) => { /* ...código existente... */ });


// --- RUTA PROTEGIDA PARA SUBIR FOTO DE PERFIL ---
// POST /api/users/profile/picture
// 1. 'protect' verifica el token. 2. 'upload' sube la foto. 3. La función final actualiza la DB.
router.post('/profile/picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.profilePicture = req.file ? req.file.path : user.profilePicture;
      const updatedUser = await user.save();

      // Devolvemos el usuario actualizado para que el AuthContext se actualice
      res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        token: jwt.sign({ id: updatedUser._id, role: updatedUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' }),
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


export default router;