import { apiClient } from './apiClient.js';

// ============================================================
// AUTH API
// ============================================================
export const authApi = {
  signup(payload) {
    return apiClient.post('/auth/signup', payload);
  },
  login(identifier, password) {
    return apiClient.post('/auth/login', { identifier, password });
  },
  me() {
    return apiClient.get('/auth/me');
  },
  changePassword(newPassword) {
    return apiClient.post('/auth/change-password', { newPassword });
  },
};

// ============================================================
// BILLING API (for public plans)
// ============================================================
export const billingApi = {
  getPlans: (currency = 'USD') => apiClient.get(`/billing/plans?currency=${currency}`),
};