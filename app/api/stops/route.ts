import { NextResponse } from "next/server";
import { connectBMTC } from "@/lib/bmtc";
import Stop from "@/models/stops";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  if (!search) return NextResponse.json([]);

  try {
    await connectBMTC();

    const stops = await Stop.find(
      {
        stop_name: { $regex: search, $options: "i" },
      },
      { stop_id: 1, stop_name: 1 }
    )
      .limit(20)
      .lean();

    return NextResponse.json(stops);
  } catch (err) {
    console.error("❌ STOP SEARCH ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
