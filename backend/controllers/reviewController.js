const reviewService = require("../services/reviewService");

// GET /api/products/:productId/reviews
const getReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviewsByProduct(req.params.productId);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// POST /api/products/:productId/reviews
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await reviewService.createReview(
      req.user._id,
      req.params.productId,
      { rating, comment }
    );
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:productId/reviews/:reviewId
const deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.deleteReview(
      req.user._id,
      req.user.role,
      req.params.reviewId
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  createReview,
  deleteReview,
};

