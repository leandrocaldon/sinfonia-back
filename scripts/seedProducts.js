import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import fs from 'fs';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const data = JSON.parse(fs.readFileSync('./products.example.json', 'utf8'));
  await Product.deleteMany();
  await Product.insertMany(data);
  console.log('Productos de ejemplo insertados');
  mongoose.disconnect();
}

seed();
