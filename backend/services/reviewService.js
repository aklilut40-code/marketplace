const Review = require("../models/Review");
const Product = require("../models/Product");

const getReviewsByProduct = async (productId) => {
  const reviews = await Review.find({ product: productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  return reviews;
};

const createReview = async (userId, productId, { rating, comment }) => {
  if (!rating || rating < 1 || rating > 5) {
    const error = new Error("Rating must be between 1 and 5");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const existingReview = await Review.findOne({
    product: productId,
    user: userId,
  });

  if (existingReview) {
    const error = new Error("You have already reviewed this product");
    error.statusCode = 400;
    throw error;
  }

  const review = await Review.create({
    product: productId,
    user: userId,
    rating: Number(rating),
    comment: comment || "",
  });

  return Review.findById(review._id).populate("user", "name");
};

const deleteReview = async (userId, userRole, reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  if (userRole !== "admin" && review.user.toString() !== userId.toString()) {
    const error = new Error("Not authorized to delete this review");
    error.statusCode = 403;
    throw error;
  }

  await Review.findByIdAndDelete(reviewId);
  return { message: "Review deleted" };
};

module.exports = {
  getReviewsByProduct,
  createReview,
  deleteReview,
};

