const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['entrada', 'ajuste_entrada', 'ajuste_saida', 'perda', 'venda']
  },
  quantity: {
    type: Number,
    required: true
  },
  note: {
    type: String,
    trim: true
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  user: {
    type: String,
    required: true
  },
  cafeteria: {
    type: String,
    required: true,
    default: 'Cafeteria Principal'
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);