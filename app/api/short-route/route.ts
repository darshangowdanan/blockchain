import { NextResponse } from "next/server";
import { connectBMTC } from "@/lib/bmtc";
import { StopModel, EdgeModel } from "@/models/stops";
import { buildGraph, dijkstra, Edge } from "@/lib/graph";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fromStop = Number(searchParams.get("from"));
  const toStop = Number(searchParams.get("to"));

  if (!fromStop || !toStop) {
    return NextResponse.json({ error: "Missing from or to stop" }, { status: 400 });
  }

  try {
    const conn = await connectBMTC();
    const Stop = StopModel(conn);
    const Edge = EdgeModel(conn);

    const edges = await Edge.find({}).lean();
    const stops = await Stop.find({}, { stop_id: 1, stop_name: 1 }).lean();

    const stopMap = stops.reduce((acc: Record<number, string>, stop) => {
      acc[stop.stop_id] = stop.stop_name;
      return acc;
    }, {});

    // .lean() returns plain objects; assert them to Edge[] so buildGraph gets the expected shape
    const graph = buildGraph(edges as unknown as Edge[]);
    const { path, distance } = dijkstra(graph, fromStop, toStop);

    // Convert path from stop_ids to stop_names
    const pathNames = path.map(id => stopMap[id] || id);

    return NextResponse.json({ path: pathNames, distance });
  } catch (error) {
    console.error("Shortest Route Error:", error);
    return NextResponse.json({ error: "Failed to calculate route" }, { status: 500 });
  }
}
