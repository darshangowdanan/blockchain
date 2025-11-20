import { NextResponse } from "next/server";
import { connectBMTC } from "@/lib/bmtc";
import StopModel from "@/models/stops";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  if (!search) return NextResponse.json([]);

  try {
    // Get BMTC connection
    const conn = await connectBMTC();

    // Load model from this connection
    const Stop = StopModel(conn);

    const stops = await Stop.find(
      { stop_name: { $regex: search, $options: "i" } },
      { stop_name: 1 }
    )
      .limit(10)
      .lean();

    return NextResponse.json(stops.map((s) => s.stop_name));
  } catch (error) {
    console.error("Stops API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stops" }, { status: 500 });
  }
}
