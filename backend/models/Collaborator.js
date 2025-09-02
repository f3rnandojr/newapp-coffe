const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const collaboratorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  department: {
    type: String,
    required: true,
    enum: ['TI', 'RH', 'Vendas', 'Financeiro', 'Marketing', 'Produção', 'Administrativo', 'Outros']
  },
  maxValue: {
    type: Number,
    required: true,
    min: 0
  },
  availableBalance: {
    type: Number,
    required: true,
    min: 0,
    default: function() {
      return this.maxValue;
    }
  },
  login: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

// Hash password before saving
collaboratorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
collaboratorSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('Collaborator', collaboratorSchema);