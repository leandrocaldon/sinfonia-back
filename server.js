import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact', contactRoutes);

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
