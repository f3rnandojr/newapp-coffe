const express = require('express');
const router = express.Router();
const movementsController = require('../controllers/movementsController');

// Registrar movimentação de estoque
router.post('/', movementsController.registerMovement);

// Obter histórico de movimentações
router.get('/', movementsController.getMovementsHistory);

module.exports = router;