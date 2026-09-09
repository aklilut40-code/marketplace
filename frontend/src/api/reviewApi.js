import client from './client';

// GET /api/products/:productId/reviews
export const getProductReviews = async (productId) => {
  const response = await client.get(`/products/${productId}/reviews`);
  return response.data;
};

// POST /api/products/:productId/reviews
export const createProductReview = async (productId, { rating, comment }) => {
  const response = await client.post(`/products/${productId}/reviews`, {
    rating,
    comment,
  });
  return response.data;
};

// DELETE /api/products/:productId/reviews/:reviewId
export const deleteProductReview = async (productId, reviewId) => {
  const response = await client.delete(`/products/${productId}/reviews/${reviewId}`);
  return response.data;
};

