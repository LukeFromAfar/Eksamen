require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import custom security middleware
const helmetMiddleware = require('./middleware/helmetMiddleware');
const setupRateLimiting = require('./middleware/rateLimitMiddleware');

// API routes
const userRoutes = require('./routes/userRoutes');

// Middleware imports
const { jsonParsingErrorHandler, globalErrorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

// Apply security middleware
app.use(helmetMiddleware);
setupRateLimiting(app); // Apply rate limiting

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Add cookie parser for JWT cookies

// Add JSON parsing error handling
app.use(jsonParsingErrorHandler);

// Routes
app.use('/api', userRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  // Security and performance options
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false
})
  .then(() => {
    console.log('Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

// Enhanced error handling middleware
app.use(globalErrorHandler);

// 404 handler for undefined routes
app.use(notFoundHandler);