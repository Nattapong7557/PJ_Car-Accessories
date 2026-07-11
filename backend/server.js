const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env variables
dotenv.config();

// Import routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express
const app = express();

// ============================================
// Middleware
// ============================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ============================================
// API Routes
// ============================================
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// API Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AutoParts Pro API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Unmatched /api/* routes -> 404 JSON
// ============================================
// IMPORTANT: without this, a request like GET /api/typo or a route that
// doesn't exist under any router above falls straight through to the
// "*" handler below, whose `if (!req.path.startsWith('/api'))` guard
// is false, so it neither sends a file NOR calls res.status(404) —
// the request just hangs with no response at all. This handler makes
// sure every /api request always gets an answer.
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `ไม่พบ API endpoint: ${req.method} ${req.originalUrl}`
  });
});

// ============================================
// Serve Frontend (multi-page site)
// ============================================
// Everything under /api/* is already answered above (either by a route
// or by the 404 handler), so anything that reaches here is a page
// request (e.g. /index.html, /pages/login.html). Files that exist were
// already served by express.static; this only runs for the remaining
// non-API paths, so it's safe to always send index.html here.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ============================================
// Error Handler (ต้องอยู่หลัง routes)
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(' AutoParts Pro Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  Environment : ${process.env.NODE_ENV}`);
      console.log(`  Port        : ${PORT}`);
      console.log(`  API         : http://localhost:${PORT}/api`);
      console.log(`  Frontend    : http://localhost:${PORT}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });
  } catch (error) {
    console.error(' Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();