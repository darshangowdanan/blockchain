import { NextResponse } from "next/server";
import { connectBMTC } from "@/lib/bmtc";
import { StopModel, EdgeModel, RouteModel } from "@/models/stops";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "stops"; // stops, edges, route
  const query = searchParams.get("query") || "";

  if (!query) return NextResponse.json([]);

  try {
    const conn = await connectBMTC();
    let result: Record<string, any>[] = [];

    switch (type.toLowerCase()) {
      case "stops":
        const Stop = StopModel(conn);
        result = await Stop.find(
          { stop_name: { $regex: query, $options: "i" } },
          { stop_name: 1, stop_id: 1, lat: 1, lng: 1 }
        )
          .limit(10)
          .lean();
        break;

      case "edges":
        const Edge = EdgeModel(conn);
        const queryNumEdge = Number(query); // convert stop id to number
        result = await Edge.find({
          $or: [
            { from_stop: queryNumEdge },
            { to_stop: queryNumEdge },
            { route_id: query },
          ],
        })
          .limit(10)
          .lean();
        break;

      case "route":
        const Route = RouteModel(conn);
        const queryNumRoute = Number(query); // for stop ids in route.stops array
        result = await Route.find({
          $or: [
            { route_name: { $regex: query, $options: "i" } },
            { route_id: query },
            { stops: queryNumRoute },
          ],
        })
          .limit(10)
          .lean();
        break;

      default:
        result = [];
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
