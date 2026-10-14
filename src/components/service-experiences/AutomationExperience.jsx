import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Glyph, ModuleHeading, SegmentedControl } from './shared.jsx';

/* ==================================================================
 * Pop-up 4 — Automatisierung
 *
 * Ein Orchestrierungs-Dashboard in vier Kapiteln:
 *
 *   1  Workflow-Canvas   — zwei Ablaeufe (Business, AI/RAG), Node-Inspector
 *   2  Grundlagen        — Trigger, Bedingungen, Fehler, Zustand als Widgets
 *   3  Execution Log     — erfolgreicher Lauf und kontrollierte Wiederholung
 *   4  Praxis            — sechs Ablaeufe, die sich automatisieren lassen
 *
 * Abgrenzung zu Pop-up 3 (API Integration): dort geht es darum, wie Systeme
 * miteinander sprechen. Hier geht es darum, was automatisch passieren soll
 * und wie dieser Ablauf gesteuert wird — Ausloeser, Entscheidungen, Zustand.
 *
 * Alle Ablaeufe und Logs sind illustrative Beispiele, keine Messwerte.
 * ================================================================== */

/* ------------------------------------------------------------------
 * Workflows
 *
 * Jede Node traegt ihre Rasterposition fuer Desktop (d: [Spalte, Zeile])
 * und Handy (m: [Spalte, Zeile]; 'full' = volle Breite). Die Verbindungen
 * werden nicht gezeichnet, sondern aus den tatsaechlichen Positionen der
 * Nodes berechnet — dasselbe Datenmodell traegt dadurch das breite Canvas
 * und die senkrechte Handy-Fassung.
 *
 * `script` beschreibt einen Lauf: Node ausfuehren, Verbindung durchlaufen,
 * naechste Node. An Verzweigungen wird ein Pfad genommen, der andere
 * bleibt sichtbar uebersprungen.
 * ------------------------------------------------------------------ */

const WORKFLOWS = {
  business: {
    id: 'business',
    label: 'Business Workflow',
    name: 'Neue Kundenanfrage',
    defaultNode: 'condition',
    nodes: [
      {
        id: 'form',
        kind: 'trigger',
        icon: 'bolt',
        type: 'Trigger',
        title: 'Form Submit',
        sub: 'Neue Anfrage',
        d: [1, 2],
        m: ['full', 1],
        about: 'Ein Formular wird abgeschickt – damit beginnt der Lauf.',
        rows: [['Event', 'form.submitted'], ['Output', 'contact + message']],
      },
      {
        id: 'validate',
        kind: 'logic',
        icon: 'braces',
        type: 'Validation',
        title: 'Validate',
        sub: 'Pflichtfelder prüfen',
        d: [2, 2],
        m: ['full', 2],
        about: 'Fehlt etwas Wichtiges, endet der Lauf hier – statt drei Schritte später Folgefehler zu erzeugen.',
        rows: [['Input', 'contact + message'], ['Rule', 'email, message required'], ['Output', 'valid_request']],
      },
      {
        id: 'condition',
        kind: 'logic',
        icon: 'branch',
        type: 'Routing',
        title: 'Condition',
        sub: 'Anfrage qualifiziert?',
        d: [3, 2],
        m: ['full', 3],
        about: 'Eine Bedingung entscheidet, welcher Pfad als Nächstes läuft.',
        rows: [['Rule', 'qualified = true'], ['Wenn ja', 'CRM'], ['Wenn nein', 'Follow-up']],
      },
      {
        id: 'crm',
        kind: 'action',
        icon: 'user',
        type: 'Action',
        title: 'CRM',
        sub: 'Kontakt anlegen',
        d: [4, 1],
        m: [1, 4],
        about: 'Der qualifizierte Kontakt wird angelegt – einmal, vollständig, ohne Abtippen.',
        rows: [['Input', 'qualified_lead'], ['Action', 'create contact'], ['Output', 'contact_id']],
      },
      {
        id: 'followup',
        kind: 'logic',
        icon: 'history',
        type: 'Action',
        title: 'Follow-up',
        sub: 'Später nachfassen',
        d: [4, 3],
        m: [2, 4],
        about: 'Nicht qualifizierte Anfragen gehen nicht verloren, sondern auf eine Nachfass-Liste. In diesem Lauf nicht nötig.',
        rows: [['Input', 'unqualified_lead'], ['Action', 'add to follow-up'], ['Output', 'task_id']],
      },
      {
        id: 'email',
        kind: 'action',
        icon: 'mail',
        type: 'Action',
        title: 'E-Mail',
        sub: 'Bestätigung senden',
        d: [5, 1],
        m: ['full', 5],
        about: 'Die anfragende Person bekommt sofort eine Bestätigung.',
        rows: [['Input', 'contact_id'], ['Action', 'send confirmation'], ['Output', 'message_id']],
      },
      {
        id: 'team',
        kind: 'action',
        icon: 'chat',
        type: 'Notification',
        title: 'Team',
        sub: 'Zuständige informieren',
        d: [6, 1],
        m: ['full', 6],
        about: 'Die zuständige Person bekommt eine kurze Zusammenfassung – mit direktem Link zum Kontakt.',
        rows: [['Input', 'contact_id + summary'], ['Action', 'notify channel'], ['Output', 'delivered']],
      },
    ],
    edges: [
      { id: 'form>validate', from: 'form', to: 'validate' },
      { id: 'validate>condition', from: 'validate', to: 'condition' },
      { id: 'condition>crm', from: 'condition', to: 'crm', label: 'Ja' },
      { id: 'condition>followup', from: 'condition', to: 'followup', label: 'Nein' },
      { id: 'crm>email', from: 'crm', to: 'email' },
      { id: 'email>team', from: 'email', to: 'team' },
    ],
    script: [
      { node: 'form' },
      { edge: 'form>validate' },
      { node: 'validate' },
      { edge: 'validate>condition' },
      { node: 'condition' },
      { edge: 'condition>crm', skipEdges: ['condition>followup'], skipNodes: ['followup'] },
      { node: 'crm' },
      { edge: 'crm>email' },
      { node: 'email' },
      { edge: 'email>team' },
      { node: 'team' },
    ],
  },
  rag: {
    id: 'rag',
    label: 'AI / RAG Workflow',
    name: 'Supportfrage mit Wissensbasis',
    defaultNode: 'retrieve',
    nodes: [
      {
        id: 'trigger',
        kind: 'trigger',
        icon: 'bolt',
        type: 'Trigger',
        title: 'Trigger',
        sub: 'Neue Anfrage',
        d: [1, 2],
        m: ['full', 1],
        about: 'Eine Nachricht kommt an – aus Chat, Formular oder per Webhook.',
        rows: [['Event', 'message.received'], ['Output', 'raw_message']],
      },
      {
        id: 'prepare',
        kind: 'ai',
        icon: 'layers',
        type: 'Processing',
        title: 'Prepare Query',
        sub: 'Anfrage strukturieren',
        d: [2, 2],
        m: ['full', 2],
        about: 'Die Nachricht wird bereinigt und so formuliert, dass die Suche gezielt arbeiten kann.',
        rows: [['Input', 'raw_message'], ['Action', 'clean + extract intent'], ['Output', 'prepared_query']],
      },
      {
        id: 'retrieve',
        kind: 'ai',
        icon: 'database',
        type: 'Retrieval',
        title: 'Retrieve Knowledge',
        sub: 'Kontext abrufen',
        d: [3, 2],
        m: ['full', 3],
        ms: 1500,
        about: 'Aus freigegebenen Inhalten werden die Abschnitte gesucht, die zur Frage passen.',
        rows: [['Input', 'prepared_query'], ['Action', 'vector search'], ['Output', 'retrieved_context']],
      },
      {
        id: 'llm',
        kind: 'ai',
        icon: 'spark',
        type: 'LLM',
        title: 'LLM',
        sub: 'Antwort erzeugen',
        d: [4, 2],
        m: ['full', 4],
        ms: 1700,
        about: 'Das Sprachmodell formuliert einen Entwurf – auf Grundlage des abgerufenen Kontexts, nicht aus dem Bauch.',
        rows: [['Input', 'question + retrieved_context'], ['Action', 'generate'], ['Output', 'draft_response']],
      },
      {
        id: 'check',
        kind: 'logic',
        icon: 'shield',
        type: 'Validation',
        title: 'Validate Output',
        sub: 'Antwort prüfen',
        d: [5, 2],
        m: ['full', 5],
        about: 'Bevor etwas hinausgeht, wird geprüft, ob die Antwort durch Quellen gedeckt ist.',
        rows: [['Rule', 'source required'], ['On success', 'continue'], ['On failure', 'handoff']],
      },
      {
        id: 'deliver',
        kind: 'action',
        icon: 'route',
        type: 'Action',
        title: 'Deliver',
        sub: 'Ergebnis weitergeben',
        d: [6, 1],
        m: [1, 6],
        about: 'Die geprüfte Antwort geht zurück in den Kanal, aus dem die Anfrage kam.',
        rows: [['Input', 'draft_response'], ['Action', 'send reply'], ['Output', 'delivered']],
      },
      {
        id: 'handoff',
        kind: 'handoff',
        icon: 'hand',
        type: 'Handoff',
        title: 'Handoff',
        sub: 'An Menschen übergeben',
        d: [6, 3],
        m: [2, 6],
        about: 'Fehlt eine Quelle, antwortet niemand ins Blaue: Die Anfrage geht mit allem Kontext an eine Person. In diesem Lauf nicht nötig.',
        rows: [['Input', 'question + context'], ['Action', 'create review task'], ['Output', 'ticket_id']],
      },
    ],
    edges: [
      { id: 'trigger>prepare', from: 'trigger', to: 'prepare' },
      { id: 'prepare>retrieve', from: 'prepare', to: 'retrieve' },
      { id: 'retrieve>llm', from: 'retrieve', to: 'llm' },
      { id: 'llm>check', from: 'llm', to: 'check' },
      { id: 'check>deliver', from: 'check', to: 'deliver', label: 'Quelle belegt' },
      { id: 'check>handoff', from: 'check', to: 'handoff', label: 'Ohne Quelle' },
    ],
    script: [
      { node: 'trigger' },
      { edge: 'trigger>prepare' },
      { node: 'prepare' },
      { edge: 'prepare>retrieve' },
      { node: 'retrieve' },
      { edge: 'retrieve>llm' },
      { node: 'llm' },
      { edge: 'llm>check' },
      { node: 'check' },
      { edge: 'check>deliver', skipEdges: ['check>handoff'], skipNodes: ['handoff'] },
      { node: 'deliver' },
    ],
  },
};

const WORKFLOW_TABS = [
  { id: 'business', label: 'Business Workflow' },
  { id: 'rag', label: 'AI / RAG Workflow' },
];

// Ruhiger Takt: Node laeuft, kurze Pause, Verbindung, naechste Node.
// Retrieval und LLM tragen eine eigene, laengere Dauer (ms).
const NODE_MS = 720;
const PAUSE_MS = 260;
const EDGE_MS = 640;
const START_DELAY = 300;

const STATE_LABEL = {
  idle: 'Wartet',
  running: 'Läuft',
  success: 'Erfolgreich',
  warning: 'Warnung',
  error: 'Fehler',
  skipped: 'Übersprungen',
};

/* Endzustand eines Laufs — fuer reduzierte Bewegung und als Ergebnis. */
function finalStates(workflow) {
  const nodes = {};
  const edges = {};
  workflow.script.forEach((step) => {
    if (step.node) nodes[step.node] = 'success';
    if (step.edge) edges[step.edge] = 'done';
    step.skipEdges?.forEach((id) => { edges[id] = 'skipped'; });
    step.skipNodes?.forEach((id) => { nodes[id] = 'skipped'; });
  });
  return { nodes, edges };
}

const EMPTY_STATES = { nodes: {}, edges: {} };

/*
 * Startet einmal pro Mount, sobald rund 40 % des Canvas sichtbar sind.
 * Danach trennt sich der Beobachter — Hin- und Herscrollen startet nichts
 * neu. Oeffnet man das Pop-up erneut, mountet alles neu.
 */
function useOnceInView(onEnter, enabled) {
  const ref = useRef(null);
  const callbackRef = useRef(onEnter);
  useEffect(() => {
    callbackRef.current = onEnter;
  }, [onEnter]);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      callbackRef.current();
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}

/* ------------------------------------------------------------------
 * Verbindungen aus den echten Node-Positionen
 *
 * Liegt das Ziel rechts, laeuft die Kurve vom rechten zum linken Port;
 * liegt es darunter (Handy), vom unteren zum oberen. Neu gemessen wird
 * beim Wechsel des Workflows, bei Groessenaenderung und nach dem Laden
 * der Schriften — nie waehrend eines Laufs.
 * ------------------------------------------------------------------ */
function useWireGeometry(workflow, canvasRef, nodeRefs) {
  const [geometry, setGeometry] = useState({ width: 0, height: 0, edges: {} });

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base = canvas.getBoundingClientRect();
    const box = (id) => {
      const element = nodeRefs.current[id];
      if (!element) return null;
      const r = element.getBoundingClientRect();
      return {
        left: r.left - base.left,
        top: r.top - base.top,
        right: r.right - base.left,
        bottom: r.bottom - base.top,
        width: r.width,
        height: r.height,
      };
    };

    const edges = {};
    workflow.edges.forEach((edge) => {
      const a = box(edge.from);
      const b = box(edge.to);
      if (!a || !b) return;
      let p0;
      let p1;
      let p2;
      let p3;
      if (b.left >= a.right - 2) {
        p0 = { x: a.right, y: a.top + a.height / 2 };
        p3 = { x: b.left, y: b.top + b.height / 2 };
        const dx = Math.max(16, (p3.x - p0.x) / 2);
        p1 = { x: p0.x + dx, y: p0.y };
        p2 = { x: p3.x - dx, y: p3.y };
      } else {
        p0 = { x: a.left + a.width / 2, y: a.bottom };
        p3 = { x: b.left + b.width / 2, y: b.top };
        const dy = Math.max(12, (p3.y - p0.y) / 2);
        p1 = { x: p0.x, y: p0.y + dy };
        p2 = { x: p3.x, y: p3.y - dy };
      }
      const r = (value) => Math.round(value * 10) / 10;
      edges[edge.id] = {
        d: `M${r(p0.x)} ${r(p0.y)} C${r(p1.x)} ${r(p1.y)} ${r(p2.x)} ${r(p2.y)} ${r(p3.x)} ${r(p3.y)}`,
        mid: {
          x: (p0.x + 3 * p1.x + 3 * p2.x + p3.x) / 8,
          y: (p0.y + 3 * p1.y + 3 * p2.y + p3.y) / 8,
        },
      };
    });
    setGeometry({ width: base.width, height: base.height, edges });
  }, [canvasRef, nodeRefs, workflow]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const observer = new ResizeObserver(() => measure());
    observer.observe(canvas);
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [canvasRef, measure]);

  return geometry;
}

function WorkflowSection({ reducedMotion }) {
  const [workflowId, setWorkflowId] = useState('business');
  const workflow = WORKFLOWS[workflowId];
  const [selected, setSelected] = useState(workflow.defaultNode);
  const [states, setStates] = useState(() => (reducedMotion ? finalStates(workflow) : EMPTY_STATES));
  const [phase, setPhase] = useState(reducedMotion ? 'done' : 'ready');
  const [run, setRun] = useState(0);
  const timersRef = useRef([]);
  const seenRef = useRef(false);
  const canvasRef = useRef(null);
  const nodeRefs = useRef({});
  const geometry = useWireGeometry(workflow, canvasRef, nodeRefs);

  const clearTimers = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const play = useCallback((target) => {
    clearTimers();
    setRun((value) => value + 1);

    if (reducedMotion) {
      setStates(finalStates(target));
      setPhase('done');
      return;
    }

    setStates(EMPTY_STATES);
    setPhase('running');
    const at = (delay, fn) => timersRef.current.push(window.setTimeout(fn, delay));
    const setNode = (id, value) => setStates((current) => ({
      ...current, nodes: { ...current.nodes, [id]: value },
    }));
    const setEdges = (ids, value) => setStates((current) => {
      const edges = { ...current.edges };
      ids.forEach((id) => { edges[id] = value; });
      return { ...current, edges };
    });
    const setNodes = (ids, value) => setStates((current) => {
      const nodes = { ...current.nodes };
      ids.forEach((id) => { nodes[id] = value; });
      return { ...current, nodes };
    });

    let time = START_DELAY;
    target.script.forEach((step) => {
      if (step.node) {
        const duration = target.nodes.find((node) => node.id === step.node)?.ms ?? NODE_MS;
        at(time, () => setNode(step.node, 'running'));
        at(time + duration, () => setNode(step.node, 'success'));
        time += duration + PAUSE_MS;
      } else {
        at(time, () => {
          setEdges([step.edge], 'active');
          if (step.skipEdges) setEdges(step.skipEdges, 'skipped');
          if (step.skipNodes) setNodes(step.skipNodes, 'skipped');
        });
        at(time + EDGE_MS, () => setEdges([step.edge], 'done'));
        time += EDGE_MS;
      }
    });
    at(time, () => setPhase('done'));
  }, [reducedMotion]);

  // Autoplay beim ersten sinnvollen Sichtkontakt.
  const boardRef = useOnceInView(() => {
    seenRef.current = true;
    play(WORKFLOWS[workflowId]);
  }, !reducedMotion);

  const selectWorkflow = (id) => {
    if (id === workflowId) return;
    const next = WORKFLOWS[id];
    setWorkflowId(id);
    setSelected(next.defaultNode);
    nodeRefs.current = {};
    // Der neue Workflow startet sauber: einmal abspielen, wenn der Bereich
    // schon gesehen wurde; sonst im Startzustand warten.
    if (reducedMotion || seenRef.current) {
      play(next);
    } else {
      clearTimers();
      setStates(EMPTY_STATES);
      setPhase('ready');
    }
  };

  const executed = workflow.script.filter((step) => step.node);
  const doneCount = executed.filter((step) => states.nodes[step.node] === 'success').length;
  const skippedCount = Object.values(states.nodes).filter((value) => value === 'skipped').length;
  const selectedNode = workflow.nodes.find((node) => node.id === selected) ?? workflow.nodes[0];
  const selectedState = states.nodes[selectedNode.id] ?? 'idle';

  let statusText = 'Bereit';
  if (phase === 'running') statusText = `Läuft · Schritt ${Math.min(doneCount + 1, executed.length)} von ${executed.length}`;
  if (phase === 'done') statusText = `Abgeschlossen · ${executed.length} Schritte${skippedCount ? `, ${skippedCount} übersprungen` : ''}`;

  // Screenreader: nur Start und Ergebnis.
  let announcement = '';
  if (phase === 'running') announcement = `${workflow.label} läuft.`;
  if (phase === 'done' && !reducedMotion) announcement = `${workflow.label} abgeschlossen.`;

  return (
    <section className="sc-experience__section sc-flow">
      <div className="sc-flow__intro">
        <ModuleHeading title="Ein Ablauf. Viele Entscheidungen.">
          <p>
            Ein Workflow startet mit einem Auslöser und trifft unterwegs Entscheidungen. Ein Klick
            auf einen Schritt zeigt, was hineingeht, was passiert und was herauskommt.
          </p>
        </ModuleHeading>
        <SegmentedControl
          items={WORKFLOW_TABS}
          label="Workflow wählen"
          onSelect={selectWorkflow}
          selected={workflowId}
        />
      </div>

      <div className="sc-flow__board" ref={boardRef}>
        <div className="sc-flow__canvas-card">
          <header className="sc-flow__bar">
            <span className="sc-flow__name">
              <i aria-hidden="true" className={`is-${phase}`} />
              <b>{workflow.name}</b>
              <em>Illustrativer Ablauf</em>
            </span>
            <span className="sc-flow__status">{statusText}</span>
          </header>

          <div className={`sc-flow__canvas is-${workflow.id}`} ref={canvasRef}>
            <svg
              aria-hidden="true"
              className="sc-flow__wires"
              height={geometry.height}
              viewBox={`0 0 ${Math.max(1, geometry.width)} ${Math.max(1, geometry.height)}`}
              width={geometry.width}
            >
              {workflow.edges.map((edge) => {
                const shape = geometry.edges[edge.id];
                if (!shape) return null;
                const target = workflow.nodes.find((node) => node.id === edge.to);
                return (
                  <g
                    className={`sc-flow-wire is-to-${target.kind}`}
                    data-state={states.edges[edge.id] ?? 'idle'}
                    // Neuer Lauf = neue Elemente: die Strich-Animation
                    // beginnt verlaesslich von vorn.
                    key={`${run}-${edge.id}`}
                    style={{ '--sc-flow-edge-ms': `${EDGE_MS}ms` }}
                  >
                    <path className="sc-flow-wire__base" d={shape.d} />
                    <path className="sc-flow-wire__trace" d={shape.d} pathLength="1" />
                    <path className="sc-flow-wire__pulse" d={shape.d} pathLength="1" />
                  </g>
                );
              })}
            </svg>

            {workflow.edges.filter((edge) => edge.label && geometry.edges[edge.id]).map((edge) => (
              <span
                aria-hidden="true"
                className="sc-flow-edge-label"
                data-state={states.edges[edge.id] ?? 'idle'}
                key={edge.id}
                style={{ left: geometry.edges[edge.id].mid.x, top: geometry.edges[edge.id].mid.y }}
              >
                {edge.label}
              </span>
            ))}

            {workflow.nodes.map((node) => {
              const state = states.nodes[node.id] ?? 'idle';
              const isSelected = node.id === selectedNode.id;
              return (
                <button
                  aria-label={`${node.title}: ${node.sub}. Status: ${STATE_LABEL[state]}`}
                  aria-pressed={isSelected}
                  className={`sc-flow-node is-${node.kind}${isSelected ? ' is-selected' : ''}`}
                  data-state={state}
                  key={node.id}
                  onClick={() => setSelected(node.id)}
                  ref={(element) => { nodeRefs.current[node.id] = element; }}
                  style={{
                    '--d-col': node.d[0],
                    '--d-row': node.d[1],
                    '--m-col': node.m[0] === 'full' ? '1 / -1' : node.m[0],
                    '--m-row': node.m[1],
                  }}
                  type="button"
                >
                  <span aria-hidden="true" className="sc-flow-node__port is-in" />
                  <span aria-hidden="true" className="sc-flow-node__port is-out" />
                  <span className="sc-flow-node__head">
                    <span aria-hidden="true" className="sc-flow-node__icon"><Glyph name={node.icon} /></span>
                    <span className="sc-flow-node__type">{node.type}</span>
                    <i aria-hidden="true" className="sc-flow-node__dot" />
                  </span>
                  <strong>{node.title}</strong>
                  <span className="sc-flow-node__sub">{node.sub}</span>
                </button>
              );
            })}
          </div>

          <footer className="sc-flow__foot">
            <p className="sc-flow__legend" aria-hidden="true">
              <span><i className="is-running" />Läuft</span>
              <span><i className="is-success" />Erfolgreich</span>
              <span><i className="is-skipped" />Übersprungen</span>
            </p>
            {reducedMotion ? null : (
              <button
                aria-disabled={phase === 'running'}
                className="sc-flow__replay"
                onClick={() => { if (phase !== 'running') play(workflow); }}
                type="button"
              >
                <Glyph name="loop" />
                {phase === 'ready' ? 'Workflow ausführen' : 'Workflow erneut ausführen'}
              </button>
            )}
          </footer>
          <p aria-live="polite" className="sc-sr-only">{announcement}</p>
        </div>

        <aside aria-label="Node Inspector" className={`sc-flow-inspector is-${selectedNode.kind}`}>
          <span className="sc-flow-inspector__eyebrow">
            <Glyph name="eye" />
            Node Inspector
          </span>
          <div className="sc-flow-inspector__head">
            <span aria-hidden="true" className="sc-flow-node__icon"><Glyph name={selectedNode.icon} /></span>
            <div>
              <span className="sc-flow-inspector__type">{selectedNode.type}</span>
              <h4>{selectedNode.title}</h4>
            </div>
          </div>
          <p className="sc-flow-inspector__about">{selectedNode.about}</p>
          <dl className="sc-flow-inspector__rows">
            {selectedNode.rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd><code>{value}</code></dd>
              </div>
            ))}
            <div>
              <dt>Status</dt>
              <dd>
                <span className="sc-flow-inspector__state" data-state={selectedState}>
                  <i aria-hidden="true" />
                  {STATE_LABEL[selectedState]}
                </span>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
 * Grundlagen als Monitoring-Widgets
 * ------------------------------------------------------------------ */

const FOUNDATIONS = [
  {
    id: 'trigger',
    kind: 'trigger',
    icon: 'bolt',
    label: 'Trigger',
    title: 'Etwas muss den Ablauf starten.',
    text: 'Formular, Webhook, Zeitplan oder Statuswechsel – ein klarer Auslöser legt fest, wann der Prozess beginnt.',
    readout: [['event', 'form.submitted'], ['status', 'received']],
  },
  {
    id: 'conditions',
    kind: 'logic',
    icon: 'branch',
    label: 'Conditions',
    title: 'Nicht jeder Fall nimmt denselben Weg.',
    text: 'Bedingungen entscheiden, welcher Pfad als Nächstes läuft.',
    readout: [['if', 'qualified = true → sales'], ['else', '→ follow-up']],
  },
  {
    id: 'retries',
    kind: 'error',
    icon: 'loop',
    label: 'Retries & Errors',
    title: 'Ein Ausfall ist kein Absturz.',
    text: 'Fällt ein externer Dienst aus, wartet der Workflow und versucht es erneut – statt einfach zu verschwinden.',
    readout: [['attempt', '1 / 3'], ['next', 'retry scheduled']],
  },
  {
    id: 'state',
    kind: 'handoff',
    icon: 'hand',
    label: 'State & Handoff',
    title: 'Automatisch heißt nicht grenzenlos.',
    text: 'Der Workflow kennt seinen Zustand – und erkennt, wann ein Mensch übernehmen sollte.',
    readout: [['state', 'waiting_review'], ['handoff', 'ready']],
  },
];

/* ------------------------------------------------------------------
 * Execution Log — illustrative Laeufe, keine Messwerte
 * ------------------------------------------------------------------ */

const RUNS = [
  {
    id: 'success',
    label: 'Successful Run',
    result: { tone: 'success', text: 'Erfolgreich' },
    entries: [
      { time: '10:42:01', event: 'Trigger received', tone: 'success', status: 'OK' },
      { time: '10:42:01', event: 'Validation passed', tone: 'success', status: 'OK' },
      { time: '10:42:02', event: 'Knowledge retrieved', tone: 'success', status: 'OK' },
      { time: '10:42:04', event: 'LLM response created', tone: 'success', status: 'OK' },
      { time: '10:42:04', event: 'Output validated', tone: 'success', status: 'OK' },
      { time: '10:42:05', event: 'CRM updated', tone: 'success', status: 'OK' },
    ],
    title: 'Ein Lauf, lückenlos dokumentiert.',
    note: 'Jeder Schritt hinterlässt eine Spur: was passiert ist, wann – und mit welchem Ergebnis.',
  },
  {
    id: 'retry',
    label: 'Retry & Recovery',
    result: { tone: 'warning', text: 'Erholt nach 1 Retry' },
    entries: [
      { time: '10:44:11', event: 'Trigger received', tone: 'success', status: 'OK' },
      { time: '10:44:12', event: 'External service', tone: 'error', status: 'Timeout' },
      { time: '10:44:12', event: 'Retry scheduled', tone: 'warning', status: '1 / 3' },
      { time: '10:44:14', event: 'External service', tone: 'success', status: 'OK' },
      { time: '10:44:15', event: 'Workflow continued', tone: 'success', status: 'OK' },
    ],
    title: 'Ein Fehler ist nicht das Ende.',
    note: 'Ein Fehler beendet nicht gleich den ganzen Ablauf. Entscheidend ist, wie kontrolliert der Workflow darauf reagiert.',
  },
];

const TONE_MARK = { success: '✓', error: '✕', warning: '↻' };

function RunLogSection() {
  const [runId, setRunId] = useState('success');
  const current = RUNS.find((item) => item.id === runId);

  return (
    <section className="sc-experience__section sc-run-log">
      <div className="sc-run-log__intro">
        <ModuleHeading title="Jeder Schritt bleibt nachvollziehbar." />
        <SegmentedControl
          items={RUNS}
          label="Lauf wählen: erfolgreich oder mit Wiederholung"
          onSelect={setRunId}
          selected={runId}
        />
      </div>

      <div className="sc-run-log__layout">
        <div className="sc-run-log__panel" role="region" aria-label={`Execution Log: ${current.label}`}>
          <header className="sc-run-log__head">
            <span className="sc-run-log__title">
              <Glyph name="history" />
              <b>Execution Log</b>
              <em>Illustrativer Ablauf</em>
            </span>
            <span className="sc-run-log__result" data-tone={current.result.tone}>
              <i aria-hidden="true" />
              {current.result.text}
            </span>
          </header>
          <ol className="sc-run-log__list">
            {current.entries.map((entry, index) => (
              // Feste Beispielzeilen; Zeit und Ereignis koennen sich wiederholen.
              // eslint-disable-next-line react/no-array-index-key
              <li data-tone={entry.tone} key={`${current.id}-${index}`}>
                <time>{entry.time}</time>
                <span className="sc-run-log__event">{entry.event}</span>
                <span className="sc-run-log__status">
                  <i aria-hidden="true">{TONE_MARK[entry.tone]}</i>
                  {entry.status}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="sc-run-log__note" data-tone={current.result.tone}>
          <h4>{current.title}</h4>
          <p>{current.note}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
 * Praxis — was sich automatisieren laesst
 * ------------------------------------------------------------------ */

const USE_CASES = [
  {
    id: 'leads',
    trigger: 'Neue Anfrage',
    title: 'Lead Routing',
    steps: ['prüfen', 'einordnen', 'zuweisen'],
    text: 'Eine Anfrage wird geprüft, eingeordnet und landet direkt bei der Person, die sie weiterbringt.',
  },
  {
    id: 'support',
    trigger: 'Nachricht',
    title: 'AI Support',
    steps: ['verstehen', 'Wissen abrufen', 'prüfen'],
    text: 'Anfrage verstehen, Wissen abrufen, Antwort prüfen – und übergeben, wenn ein Mensch gefragt ist.',
  },
  {
    id: 'sync',
    trigger: 'Änderung',
    title: 'Data Sync',
    steps: ['erkennen', 'umformen', 'aktualisieren'],
    text: 'Eine Änderung wird erkannt, passend umgeformt und genau dort nachgezogen, wo sie hingehört.',
  },
  {
    id: 'documents',
    trigger: 'Upload',
    title: 'Document Processing',
    steps: ['auslesen', 'einordnen', 'übergeben'],
    text: 'Dokument empfangen, Inhalte auslesen, einordnen und an den nächsten Schritt übergeben.',
  },
  {
    id: 'alerts',
    trigger: 'Ereignis',
    title: 'Alerts',
    steps: ['erkennen', 'prüfen', 'benachrichtigen'],
    text: 'Ein Ereignis wird geprüft – informiert wird nur, wer wirklich handeln muss.',
  },
  {
    id: 'content',
    trigger: 'Entwurf',
    title: 'Content Workflow',
    steps: ['bearbeiten', 'freigeben', 'veröffentlichen'],
    text: 'Aufnehmen, bearbeiten, freigeben lassen – veröffentlicht wird erst nach dem Okay.',
  },
];

/* ================================================================== */

export default function AutomationExperience({ reducedMotion }) {
  return (
    <>
      <WorkflowSection reducedMotion={reducedMotion} />

      <section className="sc-experience__section sc-flow-basics">
        <ModuleHeading title="Ein Workflow ist mehr als eine Reihe von Kästchen." />
        <ul className="sc-flow-basics__grid">
          {FOUNDATIONS.map((item) => (
            <li className={`sc-flow-widget is-${item.kind}`} key={item.id}>
              <span className="sc-flow-widget__label">
                <Glyph name={item.icon} />
                {item.label}
              </span>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
              <dl className="sc-flow-widget__readout">
                {item.readout.map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <RunLogSection />

      <section className="sc-experience__section sc-flow-cases">
        <ModuleHeading title="Was sich automatisieren lässt." />
        <ul className="sc-flow-cases__grid">
          {USE_CASES.map((item) => (
            <li className="sc-flow-case" key={item.id}>
              <div className="sc-flow-case__track">
                <span className="sc-flow-case__trigger">
                  <Glyph name="bolt" />
                  {item.trigger}
                </span>
                <ol aria-label={`Ablauf: ${item.steps.join(', ')}`}>
                  {item.steps.map((step) => (
                    <li key={step}><i aria-hidden="true" /><span>{step}</span></li>
                  ))}
                </ol>
              </div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
