// lib/graph.ts
import EdgeModel from "@/models/edge";

export type Graph = Record<string, Array<{ to: string; distance: number; route: string }>>;

export async function buildGraph(): Promise<Graph> {
  const Edge = await EdgeModel();
  const edges = await Edge.find({}).lean();

  const graph: Graph = {};

  edges.forEach((e: any) => {
    const from = String(e.from_stop);
    const to = String(e.to_stop);

    if (!graph[from]) graph[from] = [];
    graph[from].push({ to, distance: e.distance_km, route: e.route_id });

    // If edges are directed, don't add reverse. If you want undirected, uncomment:
    // if (!graph[to]) graph[to] = [];
    // graph[to].push({ to: from, distance: e.distance_km, route: e.route_id });
  });

  return graph;
}
