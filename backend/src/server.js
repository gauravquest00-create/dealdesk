import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  console.log('[DealDesk Backend] Starting service...');
  await connectDB();

  const server = app.listen(ENV.PORT, () => {
    console.log(`[DealDesk Backend] Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
    console.log(`[DealDesk Backend] Health check: http://localhost:${ENV.PORT}/api/health`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('[Unhandled Rejection]', err);
  });
};

startServer();
