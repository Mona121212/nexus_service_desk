// JavaScript source code

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/dev-api', // Match all requests that start with /dev-api
        createProxyMiddleware({
            target: 'https://localhost:44338', // Backend server address
            changeOrigin: true, // Enable cross-origin request proxying
            secure: false,      // Important: set to false to allow self-signed HTTPS certificates on localhost
            pathRewrite: {
                '^/dev-api': '',  // Remove /dev-api prefix before forwarding the request to the backend
            },
        })
    );
};

