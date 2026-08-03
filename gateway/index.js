const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

const AUTH_SERVICE    = process.env.AUTH_SERVICE_URL    || "http://localhost:5001";
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || "http://localhost:5002";
const AI_SERVICE      = process.env.AI_SERVICE_URL      || "http://localhost:5003";

// CORS - must come before proxy middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type", "Accept", "Origin"],
}));

// Handle OPTIONS preflight
app.options(/(.*)/, cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));

// --- Health Check (before proxies) ----------------------------
app.get("/", (req, res) => {
  res.json({
    message: "SmartCart API Gateway Running",
    services: { auth: AUTH_SERVICE, product: PRODUCT_SERVICE, ai: AI_SERVICE },
    routes: {
      "/auth/*":       "auth-service:5001",
      "/products/*":   "product-service:5002",
      "/categories/*": "product-service:5002",
      "/cart/*":       "product-service:5002",
      "/wishlist/*":   "product-service:5002",
      "/orders/*":     "product-service:5002",
      "/ai/*":         "ai-service:5003",
      "/chat/*":       "ai-service:5003",
      "/socket.io/*":  "ai-service:5003 (WebSocket)",
    },
  });
});

// ---------------------------------------------------------------
// KEY FIX: Do NOT strip path prefix.
// Frontend calls /auth/login -> gateway forwards /auth/login to
// auth-service which mounts its router at /auth.
// ---------------------------------------------------------------

// --- Auth Service (/auth/* -> auth-service:5001/auth/*)
app.use("/auth", createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  // Preserve the /auth prefix so auth-service receives /auth/login etc.
  pathRewrite: (path, req) => "/auth" + path,
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(`[GW] ${req.method} /auth${req.path} -> ${AUTH_SERVICE}/auth${req.path}`);
    },
    error: (err, req, res) => {
      console.error("[GW] Auth Service error:", err.message);
      if (!res.headersSent) res.status(502).json({ message: "Auth service unavailable" });
    },
  },
}));

// --- Product Service -------------------------------------------
const productPaths = ["/products", "/categories", "/cart", "/wishlist", "/orders"];
productPaths.forEach((prefix) => {
  app.use(prefix, createProxyMiddleware({
    target: PRODUCT_SERVICE,
    changeOrigin: true,
    // Preserve prefix: /products/123 -> product-service/products/123
    pathRewrite: (path) => prefix + path,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[GW] ${req.method} ${prefix}${req.path} -> ${PRODUCT_SERVICE}${prefix}${req.path}`);
      },
      error: (err, req, res) => {
        console.error(`[GW] Product Service error (${prefix}):`, err.message);
        if (!res.headersSent) res.status(502).json({ message: "Product service unavailable" });
      },
    },
  }));
});

// --- AI Service ------------------------------------------------
const aiPaths = ["/ai", "/chat"];
aiPaths.forEach((prefix) => {
  app.use(prefix, createProxyMiddleware({
    target: AI_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => prefix + path,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[GW] ${req.method} ${prefix}${req.path} -> ${AI_SERVICE}${prefix}${req.path}`);
      },
      error: (err, req, res) => {
        console.error(`[GW] AI Service error (${prefix}):`, err.message);
        if (res && !res.headersSent) res.status(502).json({ message: "AI service unavailable" });
      },
    },
  }));
});

// --- Socket.io (WebSocket) ------------------------------------
app.use("/socket.io", createProxyMiddleware({
  target: AI_SERVICE,
  changeOrigin: true,
  ws: true,
  pathRewrite: (path) => "/socket.io" + path,
  on: {
    error: (err, req, res) => {
      console.error("[GW] WebSocket error:", err.message);
    },
  },
}));

// --- Start Server ---------------------------------------------
const server = app.listen(PORT, () => {
  console.log(`\n[Gateway] SmartCart API Gateway running on http://localhost:${PORT}`);
  console.log(`[Gateway] Routing:`);
  console.log(`          /auth/*       -> ${AUTH_SERVICE}`);
  console.log(`          /products/*   -> ${PRODUCT_SERVICE}`);
  console.log(`          /categories/* -> ${PRODUCT_SERVICE}`);
  console.log(`          /cart/*       -> ${PRODUCT_SERVICE}`);
  console.log(`          /wishlist/*   -> ${PRODUCT_SERVICE}`);
  console.log(`          /orders/*     -> ${PRODUCT_SERVICE}`);
  console.log(`          /ai/*         -> ${AI_SERVICE}`);
  console.log(`          /chat/*       -> ${AI_SERVICE}`);
  console.log(`          /socket.io/*  -> ${AI_SERVICE} (WebSocket)\n`);
});

// WebSocket upgrade passthrough
server.on("upgrade", (req, socket, head) => {
  console.log("[GW] WS upgrade:", req.url);
});
