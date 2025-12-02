import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/mongodb";
import { JourneyTicket } from "@/models/JourneyTicket";
import { TicketGroup } from "@/models/TicketGroup";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Not logged in" });
    }

    const { journeys, paymentId } = await req.json(); 
    if (!journeys || journeys.length === 0) {
      return NextResponse.json({ success: false, message: "No journeys found" });
    }

    await connectDB();

    // 1️⃣ Create TicketGroup
    const ticketGroup = await TicketGroup.create({
      userId: session.user.email,
      userEmail: session.user.email,
      paymentId,
      tickets: [],
    });

    // 2️⃣ Create JourneyTickets (NOW ALSO SAVING PATH)
    interface Journey {
      from: string;
      to: string;
      passengers: number;
      path?: string[];   // <-- added
    }

    const journeyTickets: mongoose.Types.ObjectId[] = await Promise.all(
      journeys.map(async (j: Journey) => {
        const ticket = await JourneyTicket.create({
          from: j.from,
          to: j.to,
          passengers: j.passengers,
          path: j.path || [],   // <-- SAVE PATH HERE
          groupId: ticketGroup._id,
          qrCode: `GROUP:${ticketGroup._id}_TICKET:${new mongoose.Types.ObjectId()}`,
        });
        return ticket._id;
      })
    );

    // 3️⃣ Update TicketGroup with ticket IDs
    ticketGroup.tickets = journeyTickets;
    await ticketGroup.save();

    return NextResponse.json({ success: true, groupId: ticketGroup._id });

  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ success: false, message: "Payment failed" });
  }
}
