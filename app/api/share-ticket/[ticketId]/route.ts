import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import JourneyTicket from "@/models/JourneyTicket";

export async function GET(req: Request, { params }: { params: { ticketId: string } }) {
  try {
    await connectDB();

    const ticket = await JourneyTicket.findById(params.ticketId);
    if (!ticket) return NextResponse.json({ success: false, message: "Ticket not found" });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("Share ticket error:", error);
    return NextResponse.json({ success: false });
  }
}

