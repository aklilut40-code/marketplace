const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Deal = require('../models/Deal');
const { getIo } = require('../socket');

exports.listForUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .skip(skip).limit(limit)
      .select('productId dealId lastMessageText updatedAt isPrivate adminVisible');

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const conv = req.conversation || await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Not found' });
    res.json(conv);
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const before = req.query.before; // optional cursor (ISO date or message id)
    const q = { conversationId: req.params.id };
    if (before) q.createdAt = { $lt: new Date(before) };
    const messages = await Message.find(q).sort({ createdAt: -1 }).limit(limit);
    res.json(messages.reverse()); // return ascending
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { text, meta } = req.body;
    const conversationId = req.params.id;
    const senderId = req.user._id;

    // confirm participation server-side
    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    if (!conv.participants.map(p => p.toString()).includes(senderId.toString())) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    const msg = await Message.create({
      conversationId,
      senderId,
      text: text || '',
      meta: meta || {}
    });

    conv.lastMessageText = msg.text || (msg.meta && msg.meta.type) || '';
    await conv.save();

    // emit to socket room
    try {
      const io = getIo();
      io.to(`conv:${conversationId}`).emit('message:new', {
        _id: msg._id,
        conversationId,
        senderId,
        text: msg.text,
        meta: msg.meta,
        createdAt: msg.createdAt
      });
    } catch (e) {
      // socket not initialized - ignore (fallback to polling)
    }

    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
};
