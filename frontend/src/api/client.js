import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
});

// Automatically attach JWT token from localStorage to every request
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to extract useful error messages
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    const customError = new Error(message);
    customError.statusCode = error.response?.status;
    customError.response = error.response;
    return Promise.reject(customError);
  }
);

/**
 * Builds full URLs for images served from the backend's /uploads path
 * (separate from the /api proxy).
 */
export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  const backendBase = (
    import.meta.env.VITE_API_URL || 'http://localhost:5000'
  ).replace(/\/api\/?$/, '').replace(/\/+$/, '');

  const cleanPath = imagePath.replace(/^\/+/, '');
  if (cleanPath.startsWith('uploads/')) {
    return `${backendBase}/${cleanPath}`;
  }
  return `${backendBase}/uploads/${cleanPath}`;
};

export default client;

