const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const companyRoutes = require('./routes/companyRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');

const app = express();

// Middleware: Enable CORS for all Vercel domains & localhost
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// API Routes mounted for standard `/api/*`, stripped `/*`, and root paths
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes);

app.use('/api/companies', companyRoutes);
app.use('/companies', companyRoutes);

app.use('/api/jobs', jobRoutes);
app.use('/jobs', jobRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/recruiter', recruiterRoutes);
app.use('/recruiter', recruiterRoutes);

app.use('/api', applicationRoutes);
app.use('/', applicationRoutes);

// Health Check Route
const healthHandler = async (req, res) => {
  const db = require('./config/db');
  let dbStatus = 'disconnected';
  try {
    const testRes = await db.query('SELECT 1');
    if (testRes.rowCount > 0) dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.status(200).json({
    success: true,
    message: 'Placemate student placement API is running',
    database_status: dbStatus,
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('API Exception:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || []
  });
});

module.exports = app;
