import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import User from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js';
import crypto from 'crypto'; // Librería nativa de Node para generar tokens seguros
import sgMail from '@sendgrid/mail'; // Librería de SendGrid

console.log("Verificando API Key de SendGrid:", process.env.SENDGRID_API_KEY ? `Existe y termina en ...${process.env.SENDGRID_API_KEY.slice(-5)}` : "NO ENCONTRADA");

const router = express.Router();

// Configuración de Cloudinary
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
        profilePicture: user.profilePicture, // <-- AÑADE ESTA LÍNEA
        token: token,
      });
    } else {
      res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
// --- RUTA NUEVA: 1. EL USUARIO PIDE RESTABLECER CONTRASEÑA ---
router.post('/forgot-password', async (req, res) => {
  let user; // <--- Declaramos 'user' aquí afuera
  try {
    user = await User.findOne({ email: req.body.email }); // <--- Le asignamos el valor aquí
    if (!user) {
      return res.json({ message: 'Si el email está registrado, recibirás un correo.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const message = `Has recibido este correo porque solicitaste un reseteo de contraseña. Por favor, haz clic en el siguiente enlace para continuar. El enlace es válido por 10 minutos:\n\n${resetUrl}`;
    
    const msg = {
      to: user.email,
      from: 'lucas.loughry@etixen.com', // ¡Usa el email que verificaste!
      subject: 'Reseteo de Contraseña - Gimnasio Municipal',
      text: message,
    };
    await sgMail.send(msg);

    res.json({ message: 'Email de reseteo enviado.' });
  } catch (error) {
    console.error(error); // Ahora esto mostrará el error de SendGrid sin romper el servidor 1
    
    // Si el usuario fue encontrado antes del error, limpiamos los tokens
    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(500).json({ message: 'Error al enviar el email.' });
  }
});
// --- RUTA NUEVA: 2. EL USUARIO ENVÍA LA NUEVA CONTRASEÑA ---
router.post('/reset-password/:token', async (req, res) => {
  try {
    // 1. Hashear el token que llega en la URL para buscarlo en la DB
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // 2. Buscar al usuario por el token y verificar que no haya expirado
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
    }

    // 3. Actualizar la contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al restablecer la contraseña.' });
  }
});

// --- RUTA PROTEGIDA PARA SUBIR FOTO DE PERFIL ---
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