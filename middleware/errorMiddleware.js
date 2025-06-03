const jsonParsingErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }
  next();
};

const globalErrorHandler = (err, req, res, next) => {
  // Log error details (but not in production logs for security)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error stack:', err.stack);
  }
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({ 
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
};

module.exports = {
  jsonParsingErrorHandler,
  globalErrorHandler,
  notFoundHandler
};
