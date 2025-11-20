import { Connection, Schema } from "mongoose";

// ---------------- Stops Schema ----------------
const StopSchema = new Schema({
  stop_id: { type: Number, required: true },
  stop_name: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
});

export function StopModel(conn: Connection) {
  return conn.models.Stop || conn.model("Stop", StopSchema, "stops");
}

// ---------------- Edges Schema ----------------
const EdgeSchema = new Schema({
  from_stop: { type: Number, required: true },
  to_stop: { type: Number, required: true },
  route_id: { type: String, required: true },
  distance_km: { type: Number },
  time: { type: Number }, // optional
});

export function EdgeModel(conn: Connection) {
  return conn.models.Edge || conn.model("Edge", EdgeSchema, "edges");
}

// ---------------- Route Schema ----------------
const RouteSchema = new Schema({
  route_id: { type: String, required: true },
  route_name: { type: String, required: true },
  stops: [{ type: Number, required: true }], // array of stop_ids
  total_distance: { type: Number },
  total_time: { type: Number },
});

export function RouteModel(conn: Connection) {
   return conn.models.Route || conn.model("Route", RouteSchema, "routes");
}
