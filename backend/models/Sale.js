const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const saleSchema = new mongoose.Schema({
  cafeteria: {
    type: String,
    required: true,
    default: 'Cafeteria Principal'
  },
  items: [saleItemSchema],
  user: {
    type: String,
    required: true
  },
  paymentType: {
    type: String,
    required: true,
    enum: ['dinheiro', 'cartao', 'pix', 'débito corporativo']
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  collaboratorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collaborator',
    default: null
  }
}, {
  timestamps: true
});

// Create index for better query performance
saleSchema.index({ createdAt: -1 });
saleSchema.index({ collaboratorId: 1, createdAt: -1 });

module.exports = mongoose.model('Sale', saleSchema);