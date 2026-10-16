const Conversation = require('../models/Conversation');

async function isParticipant(userId, conversationId) {
  const conv = await Conversation.findById(conversationId).select('participants isPrivate adminVisible');
  if (!conv) return false;
  return conv.participants.some(p => p.toString() === userId.toString());
}

function requireParticipantOrAdmin() {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: 'Not authenticated' });

      const conversationId = req.params.id || req.body.conversationId || req.query.conversationId;
      if (!conversationId) return res.status(400).json({ message: 'Missing conversation id' });

      const conv = await Conversation.findById(conversationId);
      if (!conv) return res.status(404).json({ message: 'Conversation not found' });

      // participants always can access
      if (conv.participants.map(p => p.toString()).includes(user._id.toString())) {
        req.conversation = conv;
        return next();
      }

      // admins may access only if adminVisible true
      if (user.role === 'admin' && conv.adminVisible) {
        req.conversation = conv;
        return next();
      }

      return res.status(403).json({ message: 'Access denied' });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { isParticipant, requireParticipantOrAdmin };
