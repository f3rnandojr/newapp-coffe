const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Registrar uma nova venda
router.post('/', salesController.registerSale);

// Obter histórico de vendas
router.get('/', salesController.getSalesHistory);

// Obter detalhes de uma venda específica
router.get('/:id', salesController.getSaleDetails);

module.exports = router;