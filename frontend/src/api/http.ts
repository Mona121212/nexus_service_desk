import axios from 'axios';

const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/dev-api',
});

http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        // 只有当存在 token 且请求路径【不包含】/connect/token 时才添加 Bearer 头
        if (token && !config.url?.includes('/connect/token')) {
            config.headers.Authorization = `Bearer ${token}`;
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
