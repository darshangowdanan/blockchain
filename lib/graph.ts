export type Edge = {
  from_stop: number;
  to_stop: number;
  distance: number;
  route_id: string;
};

type Graph = Record<number, { to: number; distance: number; route_id: string }[]>;

export function buildGraph(edges: Edge[]): Graph {
  const graph: Graph = {};
  edges.forEach(edge => {
    if (!graph[edge.from_stop]) graph[edge.from_stop] = [];
    graph[edge.from_stop].push({
      to: edge.to_stop,
      distance: edge.distance || 1, // default to 1 if missing
      route_id: edge.route_id,
    });
  });
  return graph;
}


export function dijkstra(graph: Graph, start: number, end: number) {
  const dist: Record<number, number> = {};
  const prev: Record<number, number | null> = {};
  const visited: Set<number> = new Set();

  Object.keys(graph).forEach(node => { dist[Number(node)] = Infinity; prev[Number(node)] = null; });
  dist[start] = 0;

  while (true) {
    // pick unvisited node with smallest distance
    let u: number | null = null;
    let minDist = Infinity;
    for (const nodeStr of Object.keys(dist)) {
      const node = Number(nodeStr);
      if (!visited.has(node) && dist[node] < minDist) {
        minDist = dist[node];
        u = node;
      }
    }

    if (u === null || u === end) break;
    visited.add(u);

    for (const edge of graph[u] || []) {
      const alt = dist[u] + edge.distance;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = u;
      }
    }
  }

  // Reconstruct path
  const path: number[] = [];
  let u: number | null = end;
  while (u != null) {
    path.unshift(u);
    u = prev[u];
  }

  return { path, distance: dist[end] };
}
