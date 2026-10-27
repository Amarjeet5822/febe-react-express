const mongoose = require("mongoose");

module.exports.connect = async () => {
  try {
    const uri = process.env.MONGODB_URL;
    if (!uri) {
      throw new Error('MONGODB_URL is not defined in environment');
    }

    mongoose.connection.on('connected', () => console.log('MongoDB connected'));
    mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
    mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // fail fast if the cluster is unreachable
      maxPoolSize: 10,                // connection pool size
    });
  } catch (error) {
    console.log('[ERROR] in connecting mongodb', error)
  }
};