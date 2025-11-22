import mongoose, { Schema, model, models } from "mongoose";

const stopSchema = new Schema(
  {
    stop_id: { type: Number, required: true },
    stop_name: { type: String, required: true },
    lat: Number,
    lng: Number,
  },
  { collection: "stops" }
);

const Stop = models.Stop || model("Stop", stopSchema);

export default Stop;
