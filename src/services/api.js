import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_KYRO_API_URL || 'http://localhost:3000/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kyro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('kyro_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (userData) => apiClient.post('/auth/login', userData),
};

// Profile API functions
export const profileAPI = {
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (profileData) => apiClient.put('/auth/profile', profileData),
};

// API Key API functions
export const apiKeyAPI = {
  getApiKeys: () => apiClient.get('/auth/api-keys'),
  createApiKey: (keyData) => apiClient.post('/auth/api-keys', keyData),
  updateApiKey: (id, keyData) => apiClient.put(`/auth/api-keys/${id}`, keyData),
  deleteApiKey: (id) => apiClient.delete(`/auth/api-keys/${id}`),
};

// Payment API functions
export const paymentAPI = {
  createPayment: (paymentData) => apiClient.post('/payments', paymentData),
  getPayment: (id) => apiClient.get(`/payments/${id}`),
  updatePayment: (id, paymentData) => apiClient.put(`/payments/${id}`, paymentData),
  listPayments: (params) => apiClient.get('/payments', { params }),
  cancelPayment: (id) => apiClient.delete(`/payments/${id}`),
  confirmPayment: (id) => apiClient.post(`/payments/${id}/confirm`),
};

// Wallet API functions
export const walletAPI = {
  createWallet: (walletData) => apiClient.post('/wallets', walletData),
  getWallet: (id) => apiClient.get(`/wallets/${id}`),
  getBalance: (id) => apiClient.get(`/wallets/${id}/balance`),
  depositFunds: (id, depositData) => apiClient.post(`/wallets/${id}/deposit`, depositData),
  withdrawFunds: (id, withdrawData) => apiClient.post(`/wallets/${id}/withdraw`, withdrawData),
  listWallets: (params) => apiClient.get('/wallets', { params }),

};

// Network Types API functions
export const networkTypeAPI = {
  listNetworkTypes: (params) => apiClient.get('/network-types', { params }),
  getNetworkType: (id) => apiClient.get(`/network-types/${id}`),
};

// Transaction API functions
export const transactionAPI = {
  createTransaction: (transactionData) => apiClient.post('/transactions', transactionData),
  getTransaction: (id) => apiClient.get(`/transactions/${id}`),
  listTransactions: (params) => apiClient.get('/transactions', { params }),
  updateTransaction: (id, transactionData) => apiClient.put(`/transactions/${id}`, transactionData),
  getTransactionStatus: (id) => apiClient.get(`/transactions/${id}/status`),
  refundTransaction: (id) => apiClient.post(`/transactions/${id}/refund`),
};

export default apiClient;