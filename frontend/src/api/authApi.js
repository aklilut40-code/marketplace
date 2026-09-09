import client from './client';

// POST /api/auth/register
export const register = async ({ name, email, password, role }) => {
  const response = await client.post('/auth/register', { name, email, password, role });
  return response.data;
};

// POST /api/auth/login
export const login = async ({ email, password }) => {
  const response = await client.post('/auth/login', { email, password });
  return response.data;
};

