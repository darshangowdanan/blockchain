import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema(
  {
    from: String,
    to: String,
    passengers: Number,
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    // store user details
    userEmail: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String },
  },
  { timestamps: true }
);

// Prevent model overwrite errors
export default mongoose.models.Ticket ||
  mongoose.model("Ticket", ticketSchema);
