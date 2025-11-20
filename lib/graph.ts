export type Edge = {
  from_stop: number;
  to_stop: number;
  distance: number;
  route_id: string;
};

export type Graph = Record<number, { to: number; distance: number; route_id: string }[]>;


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


type NodeInfo = {
  distance: number;
  prev: number | null;
  route_id: string | null;
};

export function dijkstraWithRoutes(graph: Graph, start: number, end: number) {
  const dist: Record<number, NodeInfo> = {};
  const visited = new Set<number>();

  Object.keys(graph).forEach(node => {
    const n = Number(node);
    dist[n] = { distance: Infinity, prev: null, route_id: null };
  });
  dist[start].distance = 0;

  while (true) {
    let u: number | null = null;
    let minDist = Infinity;
    for (const nodeStr of Object.keys(dist)) {
      const node = Number(nodeStr);
      if (!visited.has(node) && dist[node].distance < minDist) {
        minDist = dist[node].distance;
        u = node;
      }
    }

    if (u === null || u === end) break;
    visited.add(u);

    const transferPenalty = 5; // add penalty when route changes

for (const edge of graph[u] || []) {
  const routeChanged =
    dist[u].route_id && dist[u].route_id !== edge.route_id ? transferPenalty : 0;

  const alt = dist[u].distance + edge.distance + routeChanged;

  if (alt < dist[edge.to].distance) {
    dist[edge.to].distance = alt;
    dist[edge.to].prev = u;
    dist[edge.to].route_id = edge.route_id;
  }
}

  }

  // Reconstruct path with routes
  const path: { stop_id: number; route_id: string | null }[] = [];
  let u: number | null = end;
  while (u != null) {
    path.unshift({ stop_id: u, route_id: dist[u].route_id });
    u = dist[u].prev;
  }

  const totalDistance = dist[end].distance;
  return { path, distance: totalDistance };
}

