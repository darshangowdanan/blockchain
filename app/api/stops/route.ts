import { NextResponse } from "next/server";
import { connectBMTC } from "@/lib/bmtc";
import { StopModel } from "@/models/stops";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  if (!search) return NextResponse.json([]);

  try {
    const conn = await connectBMTC();
    const Stop = StopModel(conn);

    // Case-insensitive partial match for autocomplete
    const stops = await Stop.find(
      { stop_name: { $regex: search, $options: "i" } },
      { stop_name: 1, stop_id: 1, lat: 1, lng: 1 }
    )
      .limit(10)
      .lean();

    return NextResponse.json(stops);
  } catch (error) {
    console.error("Stops API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stops" }, { status: 500 });
  }
}
