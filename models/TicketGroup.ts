// models/TicketGroup.ts
import mongoose, { Schema, model, Model, Document } from "mongoose";
import { JourneyTicketDocument } from "./JourneyTicket";

export interface TicketGroupDocument extends Document {
  userId: string;
  userEmail: string;
  paymentId: string;
  tickets: mongoose.Types.ObjectId[] | JourneyTicketDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const ticketGroupSchema = new Schema<TicketGroupDocument>(
  {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    paymentId: { type: String, required: true },
    tickets: [{ type: Schema.Types.ObjectId, ref: "JourneyTicket" }],
  },
  { timestamps: true }
);

export const TicketGroup: Model<TicketGroupDocument> =
  mongoose.models.TicketGroup || model<TicketGroupDocument>("TicketGroup", ticketGroupSchema);
