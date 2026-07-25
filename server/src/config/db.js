const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 4000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    logger.warn(`MongoDB connection failed (${error.message}). Trying in-memory MongoDB for development...`);
  }

  if (config.env !== 'development') {
    logger.error('MongoDB connection failed in non-development environment.');
    process.exit(1);
  }

  try {
    let MongoMemoryServer;
    try {
      ({ MongoMemoryServer } = require('mongodb-memory-server'));
    } catch {
      throw new Error(
        'mongodb-memory-server is not installed. Run: npm install mongodb-memory-server --save'
      );
    }
    const memory = await MongoMemoryServer.create();
    const uri = memory.getUri('afriror');
    const conn = await mongoose.connect(uri);
    logger.info(`In-memory MongoDB connected: ${conn.connection.host}`);
  } catch (memError) {
    logger.error('Failed to start MongoDB:', memError.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err.message);
});

module.exports = connectDB;
