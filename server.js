// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// // Route imports
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const roomRoutes = require('./routes/roomRoutes');
// const roomTypeRoutes = require('./routes/roomTypeRoutes');
// const bookingRoutes = require('./routes/bookingRoutes');
// const invoiceRoutes = require('./routes/invoiceRoutes');
// const housekeepingRoutes = require('./routes/housekeepingRoutes');
// const maintenanceRoutes = require('./routes/maintenanceRoutes');
// const feedbackRoutes = require('./routes/feedbackRoutes');


// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/rooms', roomRoutes);
// app.use('/api/room-types', roomTypeRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/housekeeping', housekeepingRoutes);
// app.use('/api/maintenance', maintenanceRoutes);
// app.use('/api/feedback', feedbackRoutes);
// app.use('/api/service-requests', serviceRequestRoutes);


// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const roomTypeRoutes = require('./routes/roomTypeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const housekeepingRoutes = require('./routes/housekeepingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');


const app = express();

// Security Middleware
app.use(helmet()); // Security headers

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - API protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Logging middleware
app.use(morgan('dev')); // HTTP request logging

// Body parsing middleware with increased limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/service-requests', serviceRequestRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Hotel Management System API',
    version: '1.0.0',
    documentation: '/api/health',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// MongoDB Connection with improved options
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('ℹ️  Please check your:');
    console.log('   - MongoDB Atlas connection string');
    console.log('   - Internet connection');
    console.log('   - .env file configuration');
    process.exit(1);
  }
};

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('📊 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📊 Mongoose disconnected from MongoDB');
});

// Connect to database and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(async () => {
      await mongoose.connection.close();
      console.log('📊 MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;