const mongoose = require('mongoose');

const stakeSchema = new mongoose.Schema({
  user: String,
  asset_ids: [String],
  memo: String,
  tx: String,
  timestamp: Date,
  status: { type: String, default: 'staked' }
});

module.exports = mongoose.model('Stake', stakeSchema);
