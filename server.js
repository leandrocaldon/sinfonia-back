import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import contactRoutes from './routes/contact.js';
import uploadRoutes from './routes/upload.js';

// Configurar __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Detectar si estamos en Vercel
const isVercel = process.env.VERCEL === '1';

// Servir archivos estáticos desde la carpeta uploads o /tmp en Vercel
const uploadsDir = isVercel ? '/tmp' : path.join(__dirname, 'uploads');
app.use('/api/uploads', express.static(uploadsDir));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión a MongoDB establecida');
  // No iniciar el servidor aquí, Vercel lo hará
  // app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`)); 
}).catch(err => console.error('Error de conexión a MongoDB:', err));

// Exportar la app para Vercel
export default app;
