const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// Registrar movimentação de estoque
exports.registerMovement = async (req, res) => {
  try {
    console.log('📦 Dados recebidos no backend:', req.body);
    
    const { productId, type, quantity, note, invoiceNumber, user, cafeteria, previousStock, newStock } = req.body;
    
    // Validar campos obrigatórios
    if (!productId || !type || quantity === undefined || quantity === null) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios faltando: productId, type, quantity' 
      });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    const numericQuantity = parseInt(quantity);
    const numericPreviousStock = parseInt(previousStock) || product.stock;
    let numericNewStock = numericPreviousStock;
    
    // Atualizar estoque conforme o tipo de movimentação
    if (type === 'entrada' || type === 'ajuste_entrada') {
      numericNewStock = numericPreviousStock + numericQuantity;
    } else if (type === 'ajuste_saida' || type === 'perda' || type === 'venda') {
      if (numericPreviousStock < numericQuantity) {
        return res.status(400).json({ 
          message: `Estoque insuficiente. Estoque atual: ${numericPreviousStock}` 
        });
      }
      numericNewStock = numericPreviousStock - numericQuantity;
    }
    
    // Atualizar produto
    product.stock = numericNewStock;
    await product.save();
    
    // Registrar movimentação - USANDO OS NOMES CORRETOS DO MODELO
    const movementData = {
      productId,
      type,
      quantity: numericQuantity,
      note: note || '',
      invoiceNumber: invoiceNumber || '',
      user: user || 'admin', // CORRIGIDO: usando 'user' (nome do campo no modelo)
      cafeteria: cafeteria || 'Cafeteria Principal',
      previousStock: numericPreviousStock,
      newStock: numericNewStock
    };
    
    console.log('📝 Dados para salvar no movimento:', movementData);
    
    const movement = new StockMovement(movementData);
    await movement.save();
    
    console.log('✅ Movimentação salva com sucesso:', movement);
    
    res.status(201).json({
      message: 'Movimentação registrada com sucesso',
      movement
    });
  } catch (error) {
    console.error('❌ Erro no registerMovement:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Obter histórico de movimentações
exports.getMovementsHistory = async (req, res) => {
  try {
    const { startDate, endDate, productId, type, cafeteria } = req.query;
    
    let filter = {};
    
    // Filtrar por data
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }
    
    // Filtrar por produto
    if (productId && productId !== 'Todos') {
      filter.productId = productId;
    }
    
    // Filtrar por tipo
    if (type && type !== 'Todos') {
      filter.type = type;
    }
    
    // Filtrar por cafeteria
    if (cafeteria && cafeteria !== 'Todas') {
      filter.cafeteria = cafeteria;
    }
    
    const movements = await StockMovement.find(filter)
      .populate('productId', 'name category unit')
      .sort({ createdAt: -1 });
    
    res.json(movements);
  } catch (error) {
    console.error('❌ Erro no getMovementsHistory:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar histórico',
      error: error.message 
    });
  }
};