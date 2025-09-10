const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');



// Registrar movimentação de estoque
exports.registerMovement = async (req, res) => {
  try {
    const { productId, type, quantity, note, invoiceNumber, user, cafeteria } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    const previousStock = product.stock;
    let newStock = previousStock;
    
    // Atualizar estoque conforme o tipo de movimentação
    if (type === 'entrada' || type === 'ajuste_entrada') {
      newStock = previousStock + quantity;
    } else if (type === 'ajuste_saida' || type === 'perda' || type === 'venda') {
      if (previousStock < quantity) {
        return res.status(400).json({ 
          message: `Estoque insuficiente. Estoque atual: ${previousStock}` 
        });
      }
      newStock = previousStock - quantity;
    }
    
    // Atualizar produto - CORREÇÃO APLICADA
    product.stock = newStock;
    await product.save();
    
    // Registrar movimentação
    const movement = new StockMovement({
      productId,
      type,
      quantity,
      note,
      invoiceNumber,
      user,
      cafeteria,
      previousStock,
      newStock
    });
    
    await movement.save();
    
    res.status(201).json({
      message: 'Movimentação registrada com sucesso',
      movement,
      product: { // Retornar também o produto atualizado para referência
        _id: product._id,
        name: product.name,
        stock: product.stock
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        $lte: new Date(endDate + 'T23:59:59.999Z') // Corrigir para incluir o final do dia
      };
    }
    
    // Filtrar por produto
    if (productId) {
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
      .populate('productId', 'name category')
      .sort({ createdAt: -1 });
    
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};