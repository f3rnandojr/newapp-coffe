const mongoose = require('mongoose');
const path = require('path');

// Recarregar variáveis de ambiente especificando o caminho absoluto
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
  try {
    console.log('🔄 [database.js] MONGO_URI:', process.env.MONGO_URI ? 'EXISTE' : 'UNDEFINED');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erro de conexão MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;