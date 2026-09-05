import mongoose from 'mongoose';

export const checkHealth = (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    service: 'DealDesk API',
    status: isConnected ? 'healthy' : 'degraded',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};
