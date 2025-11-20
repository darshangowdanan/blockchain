// lib/dijkstra.ts
type PrevItem = { stop: string | null; route?: string | null };

class MinHeap {
  heap: Array<[number, string]>;
  constructor() { this.heap = []; }
  push(priority: number, value: string) {
    this.heap.push([priority, value]);
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[p][0] <= this.heap[i][0]) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }
  pop(): [number, string] | null {
    if (!this.heap.length) return null;
    if (this.heap.length === 1) return this.heap.pop()!;
    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    let i = 0;
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let smallest = i;
      if (l < this.heap.length && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
      if (r < this.heap.length && this.heap[r][0] < this.heap[smallest][0]) smallest = r;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
    return top;
  }
  size() { return this.heap.length; }
}

export function dijkstra(graph: Record<string, Array<{ to: string; distance: number; route: string }>>, start: string, goal: string) {
  const dist: Record<string, number> = {};
  const prev: Record<string, PrevItem> = {};
  const heap = new MinHeap();

  // initialize
  Object.keys(graph).forEach(node => { dist[node] = Infinity; prev[node] = { stop: null, route: null }; });
  // also ensure start and goal present in dist even if no outgoing edges
  if (!(start in dist)) dist[start] = Infinity;
  if (!(goal in dist)) dist[goal] = Infinity;

  dist[start] = 0;
  heap.push(0, start);

  while (heap.size()) {
    const top = heap.pop();
    if (!top) break;
    const [d, u] = top;
    if (d > dist[u]) continue;
    if (u === goal) break;

    const neighbors = graph[u] || [];
    for (const edge of neighbors) {
      const v = edge.to;
      const alt = dist[u] + edge.distance;
      if (alt < (dist[v] ?? Infinity)) {
        dist[v] = alt;
        prev[v] = { stop: u, route: edge.route };
        heap.push(alt, v);
      }
    }
  }

  if (dist[goal] === Infinity) return null;

  const path: string[] = [];
  let cur: string | null = goal;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur]?.stop ?? null;
  }

  return { path, distance_km: dist[goal], meta: prev };
}
