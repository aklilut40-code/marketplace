import client from './client';

// POST /api/orders
export const createOrder = async ({ items }) => {
  const response = await client.post('/orders', { items });
  return response.data;
};

// GET /api/orders
export const getOrders = async () => {
  const response = await client.get('/orders');
  return response.data;
};

// GET /api/orders/:id
export const getOrderById = async (id) => {
  const response = await client.get(`/orders/${id}`);
  return response.data;
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (id, status) => {
  const response = await client.put(`/orders/${id}/status`, { status });
  return response.data;
};

