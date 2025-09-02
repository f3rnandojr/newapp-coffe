const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  preco: {
    type: Number,
    required: true
  },
  estoque: {
    type: Number,
    default: 0
  },
  estoqueMinimo: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'Normal'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);