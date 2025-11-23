import { Schema } from "mongoose";
import { connectBMTC } from "@/lib/bmtc";

const StopSchema = new Schema({
  stop_id: Number,
  stop_name: String,
});

export async function getStopModel() {
  const conn = await connectBMTC();
  return conn.models.Stop || conn.model("Stop", StopSchema, "stops");
}
