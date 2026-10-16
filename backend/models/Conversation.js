const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  lastMessageText: String,
  isPrivate: { type: Boolean, default: true },       // true => participants only
  adminVisible: { type: Boolean, default: false },   // true => admins can view
  secretReason: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ConversationSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
