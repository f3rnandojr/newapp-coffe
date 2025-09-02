const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// Obter todos os produtos
exports.getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let filter = {};
    
    // Filtrar por categoria
    if (category && category !== 'Todas') {
      filter.category = category;
    }
    
    // Filtrar por busca
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    const products = await Product.find(filter).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar um novo produto
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, minStock } = req.body;
    
    const product = new Product({
      name,
      category,
      price,
      stock: stock || 0,
      minStock: minStock || null
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar um produto
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Excluir um produto
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// productsController.js - função createProduct
const createProduct = async (req, res) => {
  try {
    console.log('📦 Dados recebidos para produto:', req.body);
    
    const product = new Product(req.body);
    const savedProduct = await product.save();
    
    console.log('✅ Produto salvo no MongoDB:', savedProduct);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('❌ Erro ao salvar produto:', error);
    res.status(400).json({ message: error.message });
  }
};