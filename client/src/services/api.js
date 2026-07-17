import axios from 'axios';

// Dev must use localhost (same-site as the Vite app) so the SameSite=Lax refresh cookie is sent.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5050/api'),
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('darna_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config || {};

    // 401 → try one token refresh, then replay the request.
    if (error.response?.status === 401 && !original._retried401) {
      original._retried401 = true;
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('darna_access_token', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('darna_access_token');
      }
    }

    // Cold start / transient network failure → retry idempotent GETs once.
    const transient =
      !error.response || error.code === 'ECONNABORTED' || [502, 503, 504].includes(error.response?.status);
    if (transient && (original.method || 'get').toLowerCase() === 'get' && !original._retriedNet) {
      original._retriedNet = true;
      await sleep(1200);
      return api(original);
    }

    return Promise.reject(error);
  }
);

export default api;
