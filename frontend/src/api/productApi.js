import client from './client';

// GET /api/products
export const getProducts = async (params = {}) => {
  const response = await client.get('/products', { params });
  return response.data;
};

// GET /api/products/:id
export const getProductById = async (id) => {
  const response = await client.get(`/products/${id}`);
  return response.data;
};

// POST /api/products
export const createProduct = async (productData) => {
  const response = await client.post('/products', productData);
  return response.data;
};

// PUT /api/products/:id
export const updateProduct = async (id, productData) => {
  const response = await client.put(`/products/${id}`, productData);
  return response.data;
};

// POST /api/products/:id/images
export const uploadProductImage = async (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await client.post(`/products/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// DELETE /api/products/:id
export const deleteProduct = async (id) => {
  const response = await client.delete(`/products/${id}`);
  return response.data;
};

