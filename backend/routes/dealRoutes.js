const express = require('express');
const router = express.Router();
const dealCtrl = require('../controllers/dealController');

// POST /api/deals/:id/discount  (seller only)
router.post('/:id/discount', dealCtrl.applyDiscount);

module.exports = router;
