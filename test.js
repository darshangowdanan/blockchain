// testMongo.ts
import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/bmtc";

// Define schemas
const stopSchema = new mongoose.Schema({
  stop_id: Number,
  stop_name: String,
  lat: Number,
  lng: Number,
});

const edgeSchema = new mongoose.Schema({
  from_stop: Number,
  to_stop: Number,
  route_id: String,
  distance_km: Number,
  time: Number,
});

const routeSchema = new mongoose.Schema({
  route_id: String,
  route_name: String,
  stops: [Number],
  total_distance: Number,
  total_time: Number,
});

async function testDB() {
  try {
    const conn = await mongoose.connect(MONGODB_URI);

    const Stop = conn.model("Stop", stopSchema, "stops");
    const Edge = conn.model("Edge", edgeSchema, "edges");
    const Route = conn.model("Route", routeSchema, "route");

    console.log("---- Stops ----");
    const stops = await Stop.find().limit(10).lean();
    console.log(stops);

    console.log("---- Edges ----");
    const edges = await Edge.find().limit(10).lean();
    console.log(edges);

    console.log("---- Routes ----");
    const routes = await Route.find().limit(10).lean();
    console.log(routes);

    await conn.disconnect();
  } catch (error) {
    console.error("DB Error:", error);
  }
}

testDB();
