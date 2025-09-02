const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
if (process.env.MONGO_URI) {
  connectDB(process.env.MONGO_URI);
} else {
  console.log('❌ MONGO_URI não encontrada');
}

const app = express();

// ✅✅✅ MIDDLEWARES PRIMEIRO ✅✅✅
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json()); // ← ESSE É CRÍTICO!

// ✅✅✅ LOGS DE REQUISIÇÃO ✅✅✅
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.url}`);
  next();
});

app.get('/api/products', async (req, res) => {
  try {
    console.log('✅ Rota GET /api/products alcançada');
    const Product = require('./models/Product');
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('❌ Erro na rota products:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅✅✅ ROTAS ✅✅✅
// POR ESTA:
console.log('🔄 Carregando rotas...');

const loadRoute = (path, name) => {
  try {
    const route = require(path);
    app.use(`/api/${name}`, route);
    console.log(`✅ Rota ${name} carregada com sucesso`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao carregar rota ${name}:`, error.message);
    console.error('Stack:', error.stack);
    return false;
  }
};

loadRoute('./routes/sales', 'sales');
loadRoute('./routes/products', 'products');
loadRoute('./routes/collaborators', 'collaborators');
loadRoute('./routes/movements', 'movements');

// ✅✅✅ ROTA HEALTH ✅✅✅
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// ✅✅✅ MIDDLEWARE DE ERRO ✅✅✅
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

// ✅✅✅ INICIAR SERVIDOR ✅✅✅
const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ✅✅✅ TRATAMENTO DE ERROS GLOBAL ✅✅✅
process.on('unhandledRejection', (err) => {
  console.log('❌ Erro não tratado:', err);
});

process.on('uncaughtException', (err) => {
  console.log('❌ Exceção não capturada:', err);
});

