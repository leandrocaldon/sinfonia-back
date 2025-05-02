import mongoose from 'mongoose';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';

const MONGO_URI = process.env.MONGO_URI;

async function dbConnect() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI);
}

function verifyAdmin(req) {
  const auth = req.headers['authorization'];
  if (!auth) return null;
  const token = auth.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return null;
    return decoded;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  await dbConnect();
  if (req.method === 'GET') {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ msg: 'Error al obtener productos', error });
    }
  }
  if (req.method === 'POST') {
    const user = verifyAdmin(req);
    if (!user) return res.status(403).json({ msg: 'Solo administradores pueden crear productos' });
    try {
      const { name, description, price, image } = req.body;
      const product = new Product({ name, description, price, image });
      await product.save();
      return res.status(201).json(product);
    } catch (error) {
      return res.status(500).json({ msg: 'Error al crear producto', error });
    }
  }
  if (req.method === 'PUT') {
    const user = verifyAdmin(req);
    if (!user) return res.status(403).json({ msg: 'Solo administradores pueden modificar productos' });
    try {
      const { id, name, description, price, image } = req.body;
      const product = await Product.findByIdAndUpdate(
        id,
        { name, description, price, image },
        { new: true }
      );
      return res.json(product);
    } catch (error) {
      return res.status(500).json({ msg: 'Error al actualizar producto', error });
    }
  }
  if (req.method === 'DELETE') {
    const user = verifyAdmin(req);
    if (!user) return res.status(403).json({ msg: 'Solo administradores pueden eliminar productos' });
    try {
      const { id } = req.body;
      await Product.findByIdAndDelete(id);
      return res.json({ msg: 'Producto eliminado' });
    } catch (error) {
      return res.status(500).json({ msg: 'Error al eliminar producto', error });
    }
  }
  res.status(405).json({ msg: 'Método no permitido' });
}
