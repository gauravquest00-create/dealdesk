const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getToken = () => sessionStorage.getItem('dealdesk_token');

const clearSession = () => {
  sessionStorage.removeItem('dealdesk_token');
  sessionStorage.removeItem('dealdesk_user');
  sessionStorage.removeItem('dealdesk_business');
};

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // 🔥 Build URL with query params
    let url = `${API_BASE_URL}${endpoint}`;
    if (options.params) {
      const query = new URLSearchParams(options.params).toString();
      if (query) url += `?${query}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 402 || data.code === 'TRIAL_EXPIRED') {
        window.dispatchEvent(new CustomEvent('dealdesk:trial_expired', { detail: data }));
      }
      if (response.status === 401) {
        clearSession();
        const loginUrl = import.meta.env.VITE_LOGIN_URL || 'http://localhost:5175/login';
        window.location.href = loginUrl;
      }
      throw {
        status: response.status,
        message: data.message || 'Request failed',
        code: data.code || 'UNKNOWN_ERROR',
        data,
      };
    }

    return data;
  },

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },
  post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },
  put(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },
  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};