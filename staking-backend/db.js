const mongoose = require('mongoose');

async function connectDB() {
  await mongoose.connect('mongodb+srv://waxuser:mypassword123@cluster0.bgtplnl.mongodb.net/wax_staking?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ Conectado a MongoDB Atlas');
}

module.exports = connectDB;
