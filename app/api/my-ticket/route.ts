import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/mongodb";
import { TicketGroup } from "@/models/TicketGroup";
import { JourneyTicket } from "@/models/JourneyTicket";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Not logged in" });
    }

    await connectDB();

    // Fetch all groups of this user
    const groups = await TicketGroup.find({ userEmail: session.user.email }).populate("tickets");

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch tickets" });
  }
}
