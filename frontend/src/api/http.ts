import axios from 'axios';

const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/dev-api',
});

// Helper function to get cookie value by name
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        // 只有当存在 token 且请求路径【不包含】/connect/token 时才添加 Bearer 头
        if (token && !config.url?.includes('/connect/token')) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add AntiForgeryToken for POST, PUT, DELETE, PATCH requests
        // ABP framework uses XSRF-TOKEN cookie name
        const method = config.method?.toUpperCase();
        if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (xsrfToken) {
                config.headers['RequestVerificationToken'] = xsrfToken;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Handle 401 errors
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;
