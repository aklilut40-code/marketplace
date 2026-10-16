const express = require('express');
const router = express.Router();
const convCtrl = require('../controllers/conversationController');
const { requireParticipantOrAdmin } = require('../middleware/authHelpers');

// list conversations for user
router.get('/', convCtrl.listForUser);

// get specific conversation (participant or admin with adminVisible)
router.get('/:id', requireParticipantOrAdmin(), convCtrl.getConversation);

// get messages (participant)
router.get('/:id/messages', requireParticipantOrAdmin(), convCtrl.getMessages);

// post message
router.post('/:id/messages', requireParticipantOrAdmin(), convCtrl.sendMessage);

module.exports = router;
