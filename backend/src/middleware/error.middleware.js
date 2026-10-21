export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
};

export const errorHandler = (err, req, res, next) => {
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ message: `A record with that ${field} already exists.` });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join('. ') });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  if (statusCode >= 500) {
    console.error('Unhandled API error', JSON.stringify({
      method: req.method,
      path: req.path,
      errorName: err.name || 'Error',
      errorCode: err.code || null,
    }));
  }
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  res.status(statusCode).json({ message });
};
