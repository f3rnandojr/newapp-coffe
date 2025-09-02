const express = require('express');
const router = express.Router();
const collaboratorsController = require('../controllers/collaboratorsController');

// Obter todos os colaboradores
router.get('/', collaboratorsController.getCollaborators);

// Criar um novo colaborador
router.post('/', collaboratorsController.createCollaborator);

// Atualizar um colaborador
router.put('/:id', collaboratorsController.updateCollaborator);

// Excluir um colaborador
router.delete('/:id', collaboratorsController.deleteCollaborator);

// Redefinir senha do colaborador
router.post('/:id/reset-password', collaboratorsController.resetPassword);

// Obter histórico de compras do colaborador
router.get('/:id/history', collaboratorsController.getCollaboratorHistory);

// Obter colaborador por ID
router.get('/:id', collaboratorsController.getCollaboratorById);

module.exports = router;