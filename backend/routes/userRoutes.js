import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend'; // Usamos Resend
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import User from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Inicializamos Resend con la API Key del .env
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuración de Cloudinary (esto se queda igual)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gimnasio-perfiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage });


// --- RUTAS PÚBLICAS ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, completa todos los campos' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });
    if (user) {
      res.status(201).json({ _id: user.id, name: user.name, email: user.email });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token: token,
      });
    } else {
      res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA DE RECUPERACIÓN DE CONTRASEÑA (ACTUALIZADA CON RESEND) ---
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ message: 'Si el email está registrado, recibirás un correo.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const message = `Has recibido este correo porque solicitaste un reseteo de contraseña. Por favor, haz clic en el siguiente enlace para continuar. El enlace es válido por 10 minutos:\n\n${resetUrl}`;
    
    // Usamos Resend para enviar el email
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Remitente requerido por Resend
      to: user.email,
      subject: 'Reseteo de Contraseña - Gimnasio Municipal',
      text: message,
    });

    res.json({ message: 'Email de reseteo enviado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar el email.' });
  }
});

// --- RUTA PARA RESTABLECER LA CONTRASEÑA (se queda igual) ---
router.post('/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al restablecer la contraseña.' });
  }
});

// --- RUTA PROTEGIDA PARA SUBIR FOTO DE PERFIL (se queda igual) ---
router.post('/profile/picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.profilePicture = req.file ? req.file.path : user.profilePicture;
      const updatedUser = await user.save();
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
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;