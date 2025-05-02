import express from 'express';
import ContactMessage from '../models/ContactMessage.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware para verificar admin
function verifyAdmin(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No autorizado' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ msg: 'Solo administradores' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ msg: 'Token inválido' });
  }
}

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
    }
    const newMsg = new ContactMessage({ name, email, message });
    await newMsg.save();
    res.json({ msg: 'Mensaje recibido correctamente.' });
  } catch (err) {
    res.status(500).json({ msg: 'Error al guardar el mensaje.' });
  }
});

// GET /api/contact (solo admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener los mensajes.' });
  }
});

export default router;
