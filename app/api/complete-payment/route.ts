import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/ticket";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to complete payment" },
        { status: 401 }
      );
    }

    const body = await req.json();

    await connectDB();

    const ticket = await Ticket.create({
      ...body,
      paymentStatus: "paid",
      userEmail: session.user.email,
      userId: (session.user as { id?: string }).id ?? session.user.email,
      userName: session.user.name,
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("Payment Save Error:", error);
    return NextResponse.json(
      { error: "Payment failed" },
      { status: 500 }
    );
  }
}
