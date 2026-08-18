/**
 * ==============================================================================
 * SKILLSFY INSTITUTE OF TECHNOLOGY - PRODUCTION BACKEND SERVER
 * Self-Contained Node.js + Express + SQLite Architecture with JWT & Certificate Engine
 * ==============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Database Connection & Auto-Migration
const db = require('./database/db');

// Middleware
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply General Rate Limiter to all API endpoints
app.use('/api', apiLimiter);

// Serve Static Folders
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));
app.use(express.static(path.join(__dirname, 'public')));

// Public HTML Verification Page: /verify
app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Skillsfy Institute of Technology API Engine',
    timestamp: new Date().toISOString(),
    database: 'SQLite (Active & Connected)'
  });
});

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route '${req.originalUrl}' not found on Skillsfy server.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
    =============================================================
    🚀 SKILLSFY INSTITUTE OF TECHNOLOGY - BACKEND API SERVER
    =============================================================
    📡 Server running at: http://localhost:${PORT}
    🔍 Public Verify Page: http://localhost:${PORT}/verify
    🏥 Health Check:      http://localhost:${PORT}/api/health
    📁 SQLite Database:   backend/database/skillsfy.db
    📜 Certificates Dir:  backend/certificates/
    =============================================================
    Default Administrative Credentials (Seeded):
    👉 Super Admin: admin@skillsfy.edu  | Password: Admin@2026
    👉 Verifier:    verifier@skillsfy.edu | Password: Verifier@2026
    =============================================================
    `);
  });
}

module.exports = app;
