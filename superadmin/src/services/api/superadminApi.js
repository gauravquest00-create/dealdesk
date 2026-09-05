import { apiClient } from './apiClient.js';

export const superadminApi = {
  // ============================================================
  // AUTH
  // ============================================================
  login: (identifier, password) => apiClient.post('/auth/login', { identifier, password }),

  // ============================================================
  // DASHBOARD
  // ============================================================
  getMetrics: () => apiClient.get('/superadmin/metrics'),

  // ============================================================
  // BUSINESSES (CRUD + extra)
  // ============================================================
  listBusinesses: () => apiClient.get('/superadmin/businesses'),
  getBusinessDetail: (id) => apiClient.get(`/superadmin/businesses/${id}`),
  createBusiness: (data) => apiClient.post('/superadmin/businesses', data),
  updateBusiness: (id, data) => apiClient.put(`/superadmin/businesses/${id}`, data),
  toggleSuspension: (id, data) => apiClient.post(`/superadmin/businesses/${id}/suspend`, data),
  startSupportAccess: (id, data) => apiClient.post(`/superadmin/businesses/${id}/support-access`, data),

  // ============================================================
  // PAYMENT / ORDERS (for creating business with payment)
  // ============================================================
  createOrderForBusiness: (id, data) => apiClient.post(`/superadmin/businesses/${id}/create-order`, data),
  verifyPaymentForBusiness: (id, data) => apiClient.post(`/superadmin/businesses/${id}/verify-payment`, data),

  // ============================================================
  // SUBSCRIPTIONS & PAYMENTS
  // ============================================================
  listSubscriptions: () => apiClient.get('/superadmin/subscriptions'),
  listPayments: () => apiClient.get('/superadmin/payments'),

  // ============================================================
  // AUDIT LOGS
  // ============================================================
  listAuditLogs: () => apiClient.get('/superadmin/audit-logs'),

  // ============================================================
  // PLAN MANAGEMENT
  // ============================================================
  listPlans: () => apiClient.get('/superadmin/plans'),
  createPlan: (data) => apiClient.post('/superadmin/plans', data),
  updatePlan: (id, data) => apiClient.put(`/superadmin/plans/${id}`, data),
  deletePlan: (id) => apiClient.delete(`/superadmin/plans/${id}`),
};