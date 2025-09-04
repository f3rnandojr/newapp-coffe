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
  note: String,
  invoiceNumber: String,
  user: String, // Campo user em vez de userId
  cafeteria: String,
  previousStock: Number,
  newStock: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);