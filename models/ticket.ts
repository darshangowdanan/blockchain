import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    passengers: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    // Email = user identifier
    userEmail: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket ||
  mongoose.model("Ticket", ticketSchema);

