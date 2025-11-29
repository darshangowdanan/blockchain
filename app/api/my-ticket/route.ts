import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import Ticket from "@/models/ticket";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authConfig);

  // User not logged in → return empty array (prevents frontend crashing)
  if (!session || !session.user) {
    return NextResponse.json([]);
  }

  await connectDB();

  const tickets = await Ticket.find({ userEmail: session.user.email });

  return NextResponse.json(tickets);
}

