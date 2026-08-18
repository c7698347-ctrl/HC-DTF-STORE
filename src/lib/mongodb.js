import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hc_dtf_store';
const MONGODB_DB = process.env.MONGODB_DB || 'hc_dtf_store';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, isFallback: false };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 3000 // 3s fast timeout for fallback resilience
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('🍃 [MongoDB Engine] Connected successfully to canonical database:', MONGODB_DB);
      cached.isFallback = false;
      return mongooseInstance;
    }).catch((err) => {
      console.warn('⚠️ [MongoDB Engine] Database connection unavailable. Using canonical disk fallback:', err.message);
      cached.isFallback = true;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.isFallback = true;
  }

  return cached.conn;
}

export function isDbConnected() {
  return !!(cached.conn && mongoose.connection.readyState === 1 && !cached.isFallback);
}

export default dbConnect;
