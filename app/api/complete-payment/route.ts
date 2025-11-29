import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import Ticket from "@/models/ticket";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Not logged in" });
    }

    const { journeys } = await req.json();
    await connectDB();

    // Store each journey as separate ticket
    for (const j of journeys) {
      await Ticket.create({
        from: j.from,
        to: j.to,
        passengers: j.passengers,
        totalAmount: j.amount, // amount for that journey
        paymentStatus: "paid",
        userEmail: session.user.email,
        userId: session.user.email, // use email as user identifier
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ success: false });
  }
}
