import { apiClient } from './apiClient.js';

// ============================================================
// AUTH
// ============================================================
export const authApi = {
  login: (identifier, password) => apiClient.post('/auth/login', { identifier, password }),
  me: () => apiClient.get('/auth/me'),
  changePassword: (newPassword) => apiClient.post('/auth/change-password', { newPassword }),
};

// ============================================================
// PROPERTIES
// ============================================================
export const propertyApi = {
  list: (params) => apiClient.get(`/properties?${new URLSearchParams(params || {}).toString()}`),
  get: (id) => apiClient.get(`/properties/${id}`),
  create: (data) => apiClient.post('/properties', data),
  update: (id, data) => apiClient.put(`/properties/${id}`, data),
  getReplacements: (id) => apiClient.get(`/properties/${id}/replacement-recommendations`),
  delete: (id) => apiClient.delete(`/properties/${id}`),
};

// ============================================================
// LEADS (Authenticated)
// ============================================================
export const leadApi = {
  list: (params) => apiClient.get('/leads', { params }),
  get: (id) => apiClient.get(`/leads/${id}`),
  create: (data) => apiClient.post('/leads', data),
  update: (id, data) => apiClient.put(`/leads/${id}`, data),
  updateStatus: (id, status) => apiClient.put(`/leads/${id}/status`, { status }),
  updateTemperature: (id, temperature) => apiClient.put(`/leads/${id}/temperature`, { temperature }),
  delete: (id) => apiClient.delete(`/leads/${id}`),
  assign: (id, agentId) => apiClient.put(`/leads/${id}/assign`, { agentId }),
  bulkUpdate: (leadIds, updateData) => apiClient.post('/leads/bulk-update', { leadIds, updateData }),
  getStats: () => apiClient.get('/leads/stats'),
};

// ============================================================
// PUBLIC LEAD API (No auth required)
// ============================================================
export const publicLeadApi = {
  create: (data) => apiClient.post('/public/leads', data),
};

// ============================================================
// MATCHES
// ============================================================
export const matchApi = {
  getForProperty: (propertyId) => apiClient.get(`/matches/property/${propertyId}`),
  getForLead: (leadId) => apiClient.get(`/matches/lead/${leadId}`),
};

// ============================================================
// VIEWINGS
// ============================================================
export const viewingApi = {
  list: () => apiClient.get('/viewings'),
  schedule: (data) => apiClient.post('/viewings', data),
  submitReport: (id, data) => apiClient.post(`/viewings/${id}/report`, data),
};

// ============================================================
// OPEN HOUSES
// ============================================================
export const openHouseApi = {
  list: () => apiClient.get('/open-houses'),
  create: (data) => apiClient.post('/open-houses', data),
  registerVisitor: (data) => apiClient.post('/open-houses/public/register', data),
};

// ============================================================
// SMART QR
// ============================================================
export const qrApi = {
  list: () => apiClient.get('/qr'),
  get: (qrId) => apiClient.get(`/qr/${qrId}`),
  createOrReassign: (data) => apiClient.post('/qr', data),
  resolve: (qrId) => apiClient.get(`/qr/public/resolve/${qrId}`),
  submitEnquiry: (data) => apiClient.post('/qr/public/enquiry', data),
};

// ============================================================
// DOCUMENTS
// ============================================================
export const documentApi = {
  list: (params) => apiClient.get(`/documents?${new URLSearchParams(params || {}).toString()}`),
  create: (data) => apiClient.post('/documents', data),
  getChecklist: (propertyId) => apiClient.get(`/documents/checklist/${propertyId}`),
};

// ============================================================
// COMMUNICATIONS
// ============================================================
export const communicationApi = {
  listTemplates: () => apiClient.get('/communications/templates'),
  generateDraft: (data) => apiClient.post('/communications/draft', data),
  sendOutreach: (data) => apiClient.post('/communications/send', data),
  listHistory: () => apiClient.get('/communications/history'),
  listCampaigns: () => apiClient.get('/communications/campaigns'),
  createCampaign: (data) => apiClient.post('/communications/campaigns', data),
};

// ============================================================
// DEALS
// ============================================================
export const dealApi = {
  list: () => apiClient.get('/deals'),
  create: (data) => apiClient.post('/deals', data),
  update: (id, data) => apiClient.put(`/deals/${id}`, data),
};

// ============================================================
// TEAM
// ============================================================
export const teamApi = {
  list: () => apiClient.get('/team'),
  addAgent: (data) => apiClient.post('/team', data),
  updateAgent: (id, data) => apiClient.put(`/team/${id}`, data),
  toggleStatus: (id) => apiClient.put(`/team/${id}/toggle-status`),
  resetPassword: (id) => apiClient.post(`/team/${id}/reset-password`),
};

// ============================================================
// DASHBOARD
// ============================================================
export const dashboardApi = {
  getMetrics: () => apiClient.get('/dashboard'),
};

// ============================================================
// NOTIFICATIONS
// ============================================================
export const notificationApi = {
  list: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
};

// ============================================================
// BILLING
// ============================================================
export const billingApi = {
  getStatus: () => apiClient.get('/billing/status'),
  getPlans: (currency) => apiClient.get(`/billing/plans?currency=${currency || 'USD'}`),
  createOrder: (data) => apiClient.post('/billing/order', data),
  verifyPayment: (data) => apiClient.post('/billing/verify', data),
};

// ============================================================
// UPLOAD
// ============================================================
// ============================================================
// UPLOAD
// ============================================================
export const uploadApi = {
  upload: (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    return apiClient.post('/upload', formData);
  },
};

// ============================================================
// SOCIAL LINKS
// ============================================================
export const socialLinkApi = {
  // list with optional status filter: 'active', 'inactive', 'all'
  list: (params = {}) => apiClient.get('/social-links', { params }),
  create: (data) => apiClient.post('/social-links', data),
  getBySlug: (slug) => apiClient.get(`/social-links/slug/${slug}`),
  get: (id) => apiClient.get(`/social-links/${id}`),
  update: (id, data) => apiClient.put(`/social-links/${id}`, data),
  delete: (id) => apiClient.delete(`/social-links/${id}`),
  reactivate: (id) => apiClient.put(`/social-links/${id}/reactivate`),
  getLeads: (id) => apiClient.get(`/social-links/${id}/leads`),
};