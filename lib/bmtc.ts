import mongoose from "mongoose";

const BMTC_URI = process.env.MONGODB_BMTC_URI as string;

if (!BMTC_URI) {
  throw new Error("❌ Missing MONGODB_BMTC_URI in .env file");
}

let cached = (global as any).bmtc || { conn: null, promise: null };

export async function connectBMTC() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(BMTC_URI, {
        dbName: "bmtc",
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

(global as any).bmtc = cached;
