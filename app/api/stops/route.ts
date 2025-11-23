import { NextResponse } from "next/server";
import { getStopModel } from "@/models/stops";

export async function GET(req: Request) {
  const search = new URL(req.url).searchParams.get("search") || "";

  if (!search) return NextResponse.json([]);

  try {
    const Stop = await getStopModel();

    const stops = await Stop.find({
      stop_name: { $regex: search, $options: "i" },
    }).limit(10);

    return NextResponse.json(stops);
  } catch (err) {
    console.error("STOP SEARCH ERROR:", err);
    return NextResponse.json({ error: "Failed to search stops" }, { status: 500 });
  }
}
