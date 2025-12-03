import { NextResponse } from "next/server";
import { connectBMTC } from "@/lib/bmtc";
// import Stop from "@/models/stops";

// Temporary Graph (You will replace with your real bus route graph)
import graph from "@/data/graph.json";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = Number(searchParams.get("from"));
  const to = Number(searchParams.get("to"));

  if (!from || !to) {
    return NextResponse.json({ error: "Invalid stops" }, { status: 400 });
  }

  try {
    await connectBMTC();

    const dist: any = {};
    const prev: any = {};
    const visited = new Set();

    Object.keys(graph).forEach((key) => {
      dist[key] = Infinity;
      prev[key] = null;
    });

    dist[from] = 0;

    while (visited.size < Object.keys(graph).length) {
      let minNode = null;

      for (const node in dist) {
        if (!visited.has(node) && (minNode === null || dist[node] < dist[minNode]))
          minNode = node;
      }

      if (minNode === null) break;
      visited.add(minNode);

      const neighbors = (graph as Record<string, number[]>)[minNode] || [];
      for (const neighbor of neighbors) {
        const alt = dist[minNode] + 1;
        if (alt < dist[neighbor]) {
          dist[neighbor] = alt;
          prev[neighbor] = minNode;
        }
      }
    }

    const path = [];
    let cur = String(to);
    while (cur) {
      path.unshift(cur);
      cur = prev[cur];
    }

    if (path[0] !== String(from)) {
      return NextResponse.json({
        path: [],
        distance: null,
      });
    }

    return NextResponse.json({
      path,
      distance: path.length - 1,
    });

  } catch (err) {
    console.error("ROUTE ERROR:", err);
    return NextResponse.json({ error: "Route calculation failed" }, { status: 500 });
  }
}
