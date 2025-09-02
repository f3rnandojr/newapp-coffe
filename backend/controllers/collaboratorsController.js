const Collaborator = require('../models/Collaborator');
const Sale = require('../models/Sale');

// Obter todos os colaboradores
exports.getCollaborators = async (req, res) => {
  try {
    const { department } = req.query;
    
    let filter = {};
    
    // Filtrar por departamento
    if (department && department !== 'Todos') {
      filter.department = department;
    }
    
    const collaborators = await Collaborator.find(filter).sort({ name: 1 });
    res.json(collaborators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar um novo colaborador
exports.createCollaborator = async (req, res) => {
  try {
    const { name, email, department, maxValue } = req.body;
    
    // Gerar login automaticamente (primeiro.nome)
    const nameParts = name.toLowerCase().split(' ');
    const login = nameParts.length > 1 
      ? `${nameParts[0]}.${nameParts[nameParts.length - 1]}` 
      : nameParts[0];
    
    // Gerar senha aleatória de 6 dígitos
    const password = Math.floor(100000 + Math.random() * 900000).toString();
    
    const collaborator = new Collaborator({
      name,
      email,
      department,
      maxValue,
      availableBalance: maxValue,
      login,
      password
    });
    
    await collaborator.save();
    
    res.status(201).json({
      message: 'Colaborador criado com sucesso',
      collaborator: {
        id: collaborator._id,
        name: collaborator.name,
        email: collaborator.email,
        department: collaborator.department,
        maxValue: collaborator.maxValue,
        availableBalance: collaborator.availableBalance,
        login: collaborator.login
      },
      password
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter colaborador por ID
exports.getCollaboratorById = async (req, res) => {
  try {
    const collaborator = await Collaborator.findById(req.params.id);
    
    if (!collaborator) {
      return res.status(404).json({ message: 'Colaborador não encontrado' });
    }
    
    res.json(collaborator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Atualizar um colaborador
exports.updateCollaborator = async (req, res) => {
  try {
    const collaborator = await Collaborator.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!collaborator) {
      return res.status(404).json({ message: 'Colaborador não encontrado' });
    }
    
    res.json(collaborator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Excluir um colaborador
exports.deleteCollaborator = async (req, res) => {
  try {
    const collaborator = await Collaborator.findByIdAndDelete(req.params.id);
    
    if (!collaborator) {
      return res.status(404).json({ message: 'Colaborador não encontrado' });
    }
    
    res.json({ message: 'Colaborador excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Redefinir senha do colaborador
exports.resetPassword = async (req, res) => {
  try {
    const collaborator = await Collaborator.findById(req.params.id);
    
    if (!collaborator) {
      return res.status(404).json({ message: 'Colaborador não encontrado' });
    }
    
    // Gerar nova senha aleatória
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
    collaborator.password = newPassword;
    
    await collaborator.save();
    
    res.json({
      message: 'Senha redefinida com sucesso',
      newPassword
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter histórico de compras do colaborador
exports.getCollaboratorHistory = async (req, res) => {
  try {
    const sales = await Sale.find({ collaboratorId: req.params.id })
      .populate('items.productId', 'name category')
      .sort({ createdAt: -1 });
    
    res.json(sales);
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