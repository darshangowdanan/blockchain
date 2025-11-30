// models/JourneyTicket.ts
import mongoose, { Schema, model, Model, Document } from "mongoose";

export interface JourneyTicketDocument extends Document {
  from: string;
  to: string;
  passengers: number;
  groupId: mongoose.Types.ObjectId;
  qrCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const journeyTicketSchema = new Schema<JourneyTicketDocument>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    passengers: { type: Number, required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "TicketGroup" },
    qrCode: { type: String, required: true },
  },
  { timestamps: true }
);

export const JourneyTicket: Model<JourneyTicketDocument> =
  mongoose.models.JourneyTicket || model<JourneyTicketDocument>("JourneyTicket", journeyTicketSchema);
