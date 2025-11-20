import mongoose from "mongoose";

const BMTC_URI = process.env.MONGODB_BMTC_URI as string;

if (!BMTC_URI) {
  throw new Error("Missing MONGODB_BMTC_URI");
}

let cached = (global as any).bmtc || { conn: null, promise: null };

export async function connectBMTC() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .createConnection(BMTC_URI, {
        dbName: "bmtc",
      })
      .asPromise();
  }

  cached.conn = await cached.promise;
  (global as any).bmtc = cached;

  return cached.conn;
}
