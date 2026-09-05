import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(`[DealDesk MongoDB] Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[DealDesk MongoDB Error] ${error.message}`);
    // Do not crash server in test or offline sandbox environments
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
