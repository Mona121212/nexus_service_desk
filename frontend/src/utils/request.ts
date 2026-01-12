// JavaScript source code

import axios from 'axios';

const service = axios.create({
    // In the development environment, all requests will be prefixed with /dev-api
    // to trigger the proxy configuration
    baseURL: '/dev-api',
    timeout: 5000
});

// Add a request interceptor to attach the authentication token
service.interceptors.request.use(
    config => {
        // Assume the token is stored in localStorage
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

export default service;

