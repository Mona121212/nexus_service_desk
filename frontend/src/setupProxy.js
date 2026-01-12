const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/dev-api",
    createProxyMiddleware({
      target: "https://localhost:44338",
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        "^/dev-api": "",
      },
      // Increase timeout to prevent 504 errors during debugging
      proxyTimeout: 10000,
      timeout: 10000,

      onProxyReq: (proxyReq, req, res) => {
        console.log(
          `[Proxy] Forwarding: ${req.method} ${req.url} -> ${proxyReq.path}`
        );
      },
    })
  );
};
