const Deal = require('../models/Deal');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { getIo } = require('../socket');

exports.applyDiscount = async (req, res, next) => {
  try {
    const dealId = req.params.id;
    const { newAmount } = req.body;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (deal.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only seller can apply discount' });
    }

    deal.offerAmount = newAmount;
    await deal.save();

    // ensure conversation exists
    let conv = null;
    if (deal.conversationId) {
      conv = await Conversation.findById(deal.conversationId);
    }
    if (!conv) {
      conv = await Conversation.create({
        productId: deal.productId,
        participants: [deal.buyerId, deal.sellerId],
        dealId: deal._id,
        createdBy: deal.sellerId,
        isPrivate: true
      });
      deal.conversationId = conv._id;
      await deal.save();
    }

    const text = `Seller applied discount: ${newAmount}`;
    const msg = await Message.create({
      conversationId: conv._id,
      senderId: deal.sellerId,
      text,
      meta: { type: 'discount', amount: newAmount, dealId: deal._id }
    });

    conv.lastMessageText = msg.text;
    await conv.save();

    // emit to room
    try {
      const io = getIo();
      io.to(`conv:${conv._id}`).emit('message:new', {
        _id: msg._id,
        conversationId: conv._id,
        senderId: msg.senderId,
        text: msg.text,
        meta: msg.meta,
        createdAt: msg.createdAt
      });
    } catch (e) {}

    res.json({ deal, message: msg });
  } catch (err) {
    next(err);
  }
};
