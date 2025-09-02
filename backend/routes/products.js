const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ✅ ROTA GET - PARA BUSCAR PRODUTOS (FALTANDO)
router.get('/', async (req, res) => {
  try {
    console.log('📦 GET /api/products - Buscando produtos');
    const products = await Product.find();
    console.log(`✅ ${products.length} produtos encontrados`);
    res.json(products);
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ ROTA POST - PARA CRIAR PRODUTOS (JÁ EXISTE)
router.post('/', async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);
    const product = new Product(req.body);
    const savedProduct = await product.save();
    console.log('Produto salvo:', savedProduct);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;