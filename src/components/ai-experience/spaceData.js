/* Daten des Knowledge Space: Cluster, deterministische Punkte, Query-Position. */

function rand(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export const CLUSTERS = [
  { name: 'RAG & Backend', x: 392, y: 262, n: 18, r: 64 },
  { name: 'WordPress', x: 150, y: 176, n: 13, r: 52 },
  { name: 'APIs', x: 272, y: 112, n: 9, r: 36 },
  { name: 'Automation', x: 168, y: 420, n: 12, r: 48 },
  { name: 'Profil', x: 352, y: 474, n: 10, r: 40 },
  { name: 'Frontend', x: 512, y: 420, n: 11, r: 42 },
];

export const KNOWLEDGE_DOTS = CLUSTERS.flatMap((cluster, c) => Array.from({ length: cluster.n }, (_, i) => {
  const a = rand(c * 31 + i * 7) * Math.PI * 2;
  const d = Math.sqrt(rand(c * 17 + i * 13 + 5)) * cluster.r;
  return {
    id: `${c}-${i}`,
    x: cluster.x + Math.cos(a) * d,
    y: cluster.y + Math.sin(a) * d * 0.8,
    z: rand(c * 7 + i * 3 + 11),
    cluster: c,
  };
}));

export const SPACE_QUERY = { x: 486, y: 170 };

export function candidatesFor(q) {
  const sorted = [...KNOWLEDGE_DOTS].sort((a, b) => Math.hypot(a.x - q.x, a.y - q.y) - Math.hypot(b.x - q.x, b.y - q.y));
  return { top3: sorted.slice(0, 3).map((d) => d.id), near: sorted.slice(3, 10).map((d) => d.id) };
}
