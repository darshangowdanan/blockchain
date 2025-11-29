import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import Ticket from "@/models/ticket";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    // user not logged in
    if (!session || !session.user?.email) {
      return NextResponse.json([]);
    }

    await connectDB();

    const tickets = await Ticket.find({
      userEmail: session.user.email,
    }).sort({ createdAt: -1 }); // newest first (optional)

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json([], { status: 500 });
  }
}


