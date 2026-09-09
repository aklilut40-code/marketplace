const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getReviews,
  createReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Mounted at /api/products/:productId/reviews
router.get("/", getReviews);
router.post("/", protect, createReview);
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;

