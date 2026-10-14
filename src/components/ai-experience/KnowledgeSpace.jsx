import { CLUSTERS, KNOWLEDGE_DOTS } from './spaceData.js';

/* ==================================================================
 * Knowledge Space — der Vector Index als Raum.
 *
 * Wird zweimal verwendet: in der Knowledge Pipeline (Wissen zieht ein)
 * und in „Inside the RAG“ (Wissen wird wiedergefunden). Derselbe Raum,
 * dieselben Cluster — so verbinden sich beide Sections sichtbar.
 *
 * Koordinaten 600×600 (--u). Zustand ueber data-state:
 *   deep     weit hinten, unscharf (System Layer)
 *   search   Kamera oeffnet sich, Kandidaten reagieren
 *   retrieve irrelevante Chunks sinken, Treffer kommen nach vorn
 *   behind   verschwommen hinter dem Kontext
 *   gone     in die Tiefe verschwunden
 *   index    ruhig und vollstaendig (Knowledge Pipeline)
 * ================================================================== */

export default function KnowledgeSpace({ state, query, hits = [], candidates = [], className = '', fresh = [] }) {
  return (
    <div aria-hidden="true" className={`rx-space ${className}`} data-state={state}>
      {CLUSTERS.map((cluster) => (
        <span className="rx-space__cluster" key={cluster.name} style={{ '--x': cluster.x, '--y': cluster.y - cluster.r - 16 }}>
          {cluster.name}
        </span>
      ))}

      {query ? (
        <svg className="rx-space__links" viewBox="0 0 600 600">
          {[...hits, ...candidates].map((id) => {
            const dot = KNOWLEDGE_DOTS.find((d) => d.id === id);
            return (
              <line
                className={hits.includes(id) ? 'is-hit' : 'is-near'}
                key={id}
                pathLength="1"
                x1={query.x}
                x2={dot.x}
                y1={query.y}
                y2={dot.y}
              />
            );
          })}
        </svg>
      ) : null}

      {KNOWLEDGE_DOTS.map((dot) => {
        let role = 'far';
        if (hits.includes(dot.id)) role = 'hit';
        else if (candidates.includes(dot.id)) role = 'near';
        return (
          <i
            className="rx-space__dot"
            data-fresh={fresh.includes(dot.cluster) || undefined}
            data-role={role}
            key={dot.id}
            style={{ '--x': dot.x, '--y': dot.y, '--z': dot.z.toFixed(2) }}
          />
        );
      })}

      {query ? (
        <span className="rx-space__query" style={{ '--x': query.x, '--y': query.y }}>
          <i />
          <em>Query</em>
        </span>
      ) : null}
    </div>
  );
}
