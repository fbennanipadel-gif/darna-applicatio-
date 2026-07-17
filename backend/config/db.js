import mongoose from 'mongoose';

// Cache the connection across serverless invocations (Vercel warm starts).
let cached = global.__darnaMongoose;
if (!cached) cached = global.__darnaMongoose = { conn: null, promise: null };

export async function connectDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        // Recycle idle sockets before Atlas drops them silently (serverless-safe).
        maxIdleTimeMS: 60000,
        maxPoolSize: 5,
        minPoolSize: 0,
        retryWrites: true,
        retryReads: true,
      })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null; // allow retry on next invocation
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
