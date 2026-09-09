import client from './client';

// GET /api/cart
export const getCart = async () => {
  const response = await client.get('/cart');
  return response.data;
};

// POST /api/cart
export const addToCart = async ({ product, quantity }) => {
  const response = await client.post('/cart', { product, quantity });
  return response.data;
};

// DELETE /api/cart/:productId
export const removeFromCart = async (productId) => {
  const response = await client.delete(`/cart/${productId}`);
  return response.data;
};

