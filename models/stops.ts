import { Connection, Schema } from "mongoose";

const StopSchema = new Schema({
  stop_id: Number,
  stop_name: String,
  lat: Number,
  lng: Number,
});

export default function StopModel(conn: Connection) {
  return conn.models.Stop || conn.model("Stop", StopSchema, "stops");
}
