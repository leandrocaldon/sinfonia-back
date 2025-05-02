import express from 'express';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener productos', error });
  }
});

// Crear producto (solo admin)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Solo administradores pueden crear productos' });
    const { name, description, price, image } = req.body;
    const product = new Product({ name, description, price, image });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear producto', error });
  }
});

// Actualizar producto (solo admin)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Solo administradores pueden modificar productos' });
    const { name, description, price, image } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, image },
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ msg: 'Error al actualizar producto', error });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Solo administradores pueden eliminar productos' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar producto', error });
  }
});

export default router;
