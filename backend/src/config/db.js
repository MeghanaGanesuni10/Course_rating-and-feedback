import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌  MONGO_URI is not set in environment variables.');
    console.error('    Copy backend/.env.example to backend/.env and fill in your Atlas connection string.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'courserate',
    });

    isConnected = true;
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    console.log(`    Database: ${conn.connection.name}`);
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// Graceful shutdown helpers
const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB connection closed.');
  }
};

export { connectDB, disconnectDB };
export default connectDB;
