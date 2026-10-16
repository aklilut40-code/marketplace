const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offerAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending','accepted','rejected','cancelled','completed'], default: 'pending' },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }
}, { timestamps: true });

module.exports = mongoose.model('Deal', DealSchema);
