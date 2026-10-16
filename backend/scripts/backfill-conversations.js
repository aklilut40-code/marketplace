// run with: node backend/scripts/backfill-conversations.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Deal = require('../models/Deal');
const Conversation = require('../models/Conversation');

async function main() {
  await connectDB();
  const deals = await Deal.find({ conversationId: { $exists: false } }).limit(1000);
  console.log('deals to backfill:', deals.length);
  for (const deal of deals) {
    const conv = await Conversation.create({
      productId: deal.productId,
      participants: [deal.buyerId, deal.sellerId],
      dealId: deal._id,
      createdBy: deal.buyerId,
      isPrivate: true
    });
    deal.conversationId = conv._id;
    await deal.save();
    console.log(`backfilled deal ${deal._id} -> conv ${conv._id}`);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
