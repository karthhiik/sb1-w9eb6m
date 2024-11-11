import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  } catch (error: any) {
    console.error('Logout error:', error);
  }
};

export default api;