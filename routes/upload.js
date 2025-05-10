import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar carpeta de uploads si no existe
// En Vercel, usar /tmp para almacenamiento temporal
const isVercel = process.env.VERCEL === '1';
const uploadsDir = isVercel ? '/tmp' : path.join(__dirname, '../uploads');

// Solo crear el directorio si no estamos en Vercel
if (!isVercel && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar almacenamiento para multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Crear nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

// Filtrar para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'), false);
  }
};

// Configurar multer
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: fileFilter
});

// Endpoint para subir imágenes (requiere autenticación)
router.post('/', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }
    
    // En Vercel, no podemos guardar archivos permanentemente
    // Mejor usar Cloudinary directamente desde el frontend
    // Esta URL es temporal y solo funcionará en desarrollo local
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.API_URL || 'https://sinfonia-back.vercel.app'
      : 'http://localhost:5000';
    
    // Construir URL para la imagen
    const imageUrl = `${baseUrl}/api/uploads/${req.file.filename}`;
    
    // Nota: En producción con Vercel, esta URL no será permanente
    // ya que los archivos en /tmp se eliminan periódicamente
    
    res.status(200).json({ 
      message: 'Imagen subida correctamente',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ message: 'Error al subir la imagen' });
  }
});

// Endpoint para servir imágenes estáticas
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  // Verificar si el archivo existe
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Imagen no encontrada' });
  }
});

// Endpoint para eliminar imágenes (requiere autenticación)
router.delete('/:filename', auth, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    // Verificar si el archivo existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'Imagen eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Imagen no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ message: 'Error al eliminar la imagen' });
  }
});

export default router;
