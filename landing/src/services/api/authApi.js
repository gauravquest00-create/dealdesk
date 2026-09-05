import { apiClient } from './apiClient.js';

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
