import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/health
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[dbState] || 'unknown';

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'ok' : 'degraded',
    api: 'online',
    database: dbStatus,
    dbName: dbState === 1 ? mongoose.connection.name : null,
    timestamp: new Date().toISOString(),
  });
});

export default router;
