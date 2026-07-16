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
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        maxPoolSize: 5,
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
