import mongoose from 'mongoose';
import ContactMessage from '../models/ContactMessage.js';
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
  if (req.method === 'POST') {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
      }
      const newMsg = new ContactMessage({ name, email, message });
      await newMsg.save();
      return res.json({ msg: 'Mensaje recibido correctamente.' });
    } catch (err) {
      return res.status(500).json({ msg: 'Error al guardar el mensaje.' });
    }
  }
  if (req.method === 'GET') {
    const admin = verifyAdmin(req);
    if (!admin) return res.status(403).json({ msg: 'Solo administradores' });
    try {
      const messages = await ContactMessage.find().sort({ createdAt: -1 });
      return res.json(messages);
    } catch (err) {
      return res.status(500).json({ msg: 'Error al obtener los mensajes.' });
    }
  }
  res.status(405).json({ msg: 'Método no permitido' });
}
