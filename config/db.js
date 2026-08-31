const mongoose = require('mongoose');
 
/**
 * Singleton MongoDB connection.
 * System Plan > Design Patterns Choice: "A single MongoDB connection
 * instance will be maintained to optimize resource usage."
 */
let connectionPromise = null;
 
function connectDB(uri = process.env.MONGO_URI) {
  if (!uri) {
    throw new Error('MONGO_URI is not set. Check your .env file.');
  }
 
  if (!connectionPromise) {
    mongoose.set('strictQuery', true);
 
    connectionPromise = mongoose
      .connect(uri)
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      })
      .catch((err) => {
        connectionPromise = null; // allow a retry on next call
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }
 
  return connectionPromise;
}
 
async function disconnectDB() {
  await mongoose.connection.close();
  connectionPromise = null;
}
 
module.exports = { connectDB, disconnectDB };