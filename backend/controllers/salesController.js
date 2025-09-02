const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Collaborator = require('../models/Collaborator');
const StockMovement = require('../models/StockMovement');

// Registrar uma nova venda
exports.registerSale = async (req, res) => {
  try {
    const { cafeteria, items, user, paymentType, collaboratorId } = req.body;
    
    // Calcular total
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Verificar se é venda para colaborador e validar saldo
    if (collaboratorId && paymentType === 'débito corporativo') {
      const collaborator = await Collaborator.findById(collaboratorId);
      if (!collaborator) {
        return res.status(404).json({ message: 'Colaborador não encontrado' });
      }
      
      if (collaborator.availableBalance < total) {
        return res.status(400).json({ 
          message: `Saldo insuficiente. Saldo disponível: R$ ${collaborator.availableBalance.toFixed(2)}` 
        });
      }
      
      // Atualizar saldo do colaborador
      collaborator.availableBalance -= total;
      await collaborator.save();
    }
    
    // Registrar a venda
    const sale = new Sale({
      cafeteria,
      items,
      user,
      paymentType,
      total,
      collaboratorId: collaboratorId || null
    });
    
    await sale.save();
    
    // Atualizar estoque dos produtos
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const previousStock = product.stock;
        product.stock -= item.quantity;
        
        // Registrar movimentação de estoque
        const movement = new StockMovement({
          productId: item.productId,
          type: 'venda',
          quantity: item.quantity,
          user,
          cafeteria,
          previousStock,
          newStock: product.stock
        });
        
        await movement.save();
        await product.save();
      }
    }
    
    res.status(201).json({
      message: 'Venda registrada com sucesso',
      sale
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter histórico de vendas
exports.getSalesHistory = async (req, res) => {
  try {
    const { startDate, endDate, cafeteria, paymentType, collaboratorId } = req.query;
    
    let filter = {};
    
    // Filtrar por data
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Filtrar por cafeteria
    if (cafeteria && cafeteria !== 'Todas') {
      filter.cafeteria = cafeteria;
    }
    
    // Filtrar por tipo de pagamento
    if (paymentType && paymentType !== 'Todos') {
      filter.paymentType = paymentType;
    }
    
    // Filtrar por colaborador
    if (collaboratorId && collaboratorId !== 'Todos') {
      filter.collaboratorId = collaboratorId;
    }
    
    const sales = await Sale.find(filter)
      .populate('collaboratorId', 'name department')
      .sort({ createdAt: -1 });
    
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter detalhes de uma venda específica
exports.getSaleDetails = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('collaboratorId', 'name department')
      .populate('items.productId', 'name category');
    
    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};