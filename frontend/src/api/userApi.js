import client from './client';

// GET /api/users/me
export const getMe = async () => {
  const response = await client.get('/users/me');
  return response.data;
};

// PUT /api/users/me
export const updateMe = async ({ name, email }) => {
  const response = await client.put('/users/me', { name, email });
  return response.data;
};

// GET /api/users
export const getAllUsers = async () => {
  const response = await client.get('/users');
  return response.data;
};

