import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const MONGO_URI = process.env.MONGO_URI;

async function dbConnect() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI);
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
    const { action } = req.query;
    if (action === 'register') {
      try {
        const { name, email, password, isAdmin } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ msg: 'El usuario ya existe' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, isAdmin: !!isAdmin });
        await user.save();
        return res.status(201).json({ msg: 'Usuario registrado correctamente' });
      } catch (error) {
        return res.status(500).json({ msg: 'Error en el registro', error });
      }
    }
    if (action === 'login') {
      try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Credenciales inválidas' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas' });
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
      } catch (error) {
        return res.status(500).json({ msg: 'Error en el login', error });
      }
    }
    return res.status(400).json({ msg: 'Acción no soportada' });
  }
  res.status(405).json({ msg: 'Método no permitido' });
}
