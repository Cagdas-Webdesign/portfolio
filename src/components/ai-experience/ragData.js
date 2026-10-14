/* ==================================================================
 * Inhalte der AI-Portfolio-Assistant-Experience.
 *
 * Alle technischen Angaben stammen aus dem realen Backend
 * (portfolio-rag-backend v1.0.0, README/ARCHITECTURE). Nichts erfunden:
 * keine Scores, keine Prozentwerte, keine Latenzen.
 * ================================================================== */

/*
 * Frage fuer „✦ Assistent fragen“: eine vorbereitete Frage pro Thema, die
 * ins Eingabefeld gesetzt wird. Keine Folge-/Vertiefungsfragen.
 * Kein Fallback: ein Thema ohne Eintrag zeigt keine Aktion.
 */
export const ASK = {
  validation: 'Was wird geprüft, bevor eine Anfrage durch die RAG-Pipeline läuft?',
  chunking: 'Wie werden die Knowledge-Dokumente in diesem RAG-System konkret in Chunks zerlegt?',
  embeddings: 'Was passiert beim Query Embedding?',
  vectorsearch: 'Wie wird das Query Embedding gegen die gespeicherten Knowledge-Vektoren verglichen?',
  retrieval: 'Wie wird aus den Vector-Search-Kandidaten entschieden, welche Chunks tatsächlich weiterverwendet werden?',
  context: 'Wie werden die Retrieved Chunks zum finalen Modellkontext zusammengesetzt?',
  generation: 'Welche Informationen erhält das Generation Model tatsächlich?',
  grounding: 'Wie wird geprüft, ob ein generierter Claim tatsächlich durch den Retrieved Context gestützt wird?',
  citations: 'Wie wird eine Citation auf einen tatsächlich Retrieved Chunk zurückgeführt?',
  unknowns: 'Was passiert, wenn kein Knowledge Chunk den Retrieval Threshold erreicht?',
  metadata: 'Welche Metadaten besitzt ein einzelner Chunk?',
  worker: 'Welche Aufgabe übernimmt der Cloudflare Worker vor dem eigentlichen RAG Backend?',
  fastapi: 'Welche Verantwortung hat FastAPI in dieser Architektur?',
  core: 'Welche Aufgaben übernimmt der eigene RAG Core?',
  vectorstore: 'Wie kommuniziert der eigene Retrieval-Code mit Cloudflare Vectorize?',
  groundingProvider: 'Wie prüft dein Grounding Provider, ob eine Antwort wirklich durch die Quellen gedeckt ist?',
  runtime: 'Wie läuft das containerisierte Backend auf Google Cloud Run?',
};

/* Die reale Wissensbasis (knowledge/*.md im Backend). */
export const KNOWLEDGE_DOCS = [
  'professional-profile.md',
  'custom-rag-backend.md',
  'fullstack-web-development.md',
  'wordpress-woocommerce.md',
  'api-backend-databases.md',
  'automation-email-marketing.md',
  'plugin-development.md',
  'react-portfolio.md',
  'social-media-content.md',
  'working-style.md',
  'education-and-qualifications.md',
  'job-fit-and-contact.md',
];

export const DEMO_QUESTION = 'Wie funktioniert das Chunking in diesem RAG-System?';

/* Die zehn Stationen einer Frage (README: Request flow). */
export const STAGES = [
  { id: 'question', label: 'Question', title: 'Eine Frage kommt an.', text: 'Klartext aus dem Portfolio. Noch weiß das System nichts über ihre Bedeutung.', ask: null },
  { id: 'validation', label: 'Validation', title: 'Erst prüfen, dann rechnen.', text: 'Länge, Form und Felder werden geprüft. Unbekannte Felder werden abgelehnt, bevor irgendein Modell arbeitet.', ask: 'validation' },
  { id: 'embedding', label: 'Query Embedding', title: 'Aus Sprache wird Geometrie.', text: 'Die Frage wird zu einem Vektor mit 1024 Dimensionen. Ähnliche Bedeutung liegt jetzt nah beieinander.', ask: 'embeddings' },
  { id: 'search', label: 'Vector Search', title: 'Die Frage sucht Bedeutung, nicht Wörter.', text: 'Im Index liegen alle Wissens-Chunks als Vektoren. Gesucht wird nach Nähe im Raum.', ask: 'vectorsearch' },
  { id: 'retrieval', label: 'Retrieval', title: 'Nur die besten Treffer bleiben.', text: 'Treffer unter dem Threshold fallen weg. Die relevantesten Passagen werden aus dem Index geholt.', ask: 'retrieval' },
  { id: 'context', label: 'Context', title: 'Ein begrenzter Kontext.', text: 'Gerankt, dedupliziert, mit Label versehen und nie mitten in einer Passage abgeschnitten. Nicht die ganze Wissensbasis geht ans Modell.', ask: 'context' },
  { id: 'generation', label: 'Generation', title: 'Das Modell formuliert.', text: 'Mit Grounding-Regeln als System-Nachricht. Es schreibt nur aus dem, was im Kontext steht.', ask: 'generation' },
  { id: 'grounding', label: 'Grounding', title: 'Gestützt oder nicht veröffentlicht.', text: 'Eine Antwort ohne überprüfbare Quelle wird nicht ausgeliefert. Die Darstellung hier ist schematisch.', ask: 'grounding' },
  { id: 'citations', label: 'Citations', title: 'Quellen gehören dem Backend.', text: 'Labels werden gegen die tatsächlich abgerufenen Chunks geprüft. Unbekannte Labels werden verworfen.', ask: 'citations' },
  { id: 'answer', label: 'Answer', title: 'Antwort mit nachvollziehbaren Quellen.', text: 'Genau so erscheint sie im Assistenten: Text plus Quellen, die sich zurückverfolgen lassen.', ask: 'core' },
];

/* Retrieved Chunks fuer die Demo-Frage (Ueberschriften aus custom-rag-backend.md sinngemaess). */
export const DEMO_CHUNKS = [
  { id: 'c1', label: 'S1', doc: 'custom-rag-backend.md', section: 'Chunking', text: 'Strukturbewusst: Überschriften und Blöcke bestimmen die Grenzen.' },
  { id: 'c2', label: 'S2', doc: 'custom-rag-backend.md', section: 'Ingestion', text: 'Blöcke werden gepackt, in der Größe begrenzt und leicht überlappt.' },
  { id: 'c3', label: 'S3', doc: 'custom-rag-backend.md', section: 'Chunk-Identität', text: 'Jeder Chunk trägt ID, Fingerprint und Metadaten seiner Quelle.' },
];

export const DEMO_CLAIMS = [
  { id: 'a', text: 'Das Chunking folgt der Struktur der Dokumente.', source: 'S1', supported: true },
  { id: 'b', text: 'Blöcke werden in der Größe begrenzt und leicht überlappt.', source: 'S2', supported: true },
  { id: 'c', text: 'Die Chunks werden bei jeder Frage neu erzeugt.', source: null, supported: false },
  { id: 'd', text: 'Jeder Chunk behält Metadaten und Herkunft.', source: 'S3', supported: true },
];

export const INGESTION = [
  { id: 'doc', label: 'Dokument', text: 'Eine kuratierte, versionierte Markdown-Datei mit Frontmatter.', ask: null,
    facts: [['Format', 'Markdown'], ['Frontmatter', 'id · title · visibility · topics'], ['Struktur', 'Überschriften + Inhaltsblöcke']] },
  { id: 'normalize', label: 'Normalization', text: 'Frontmatter, Überschriften und Inhaltsblöcke werden erkannt. Herkunft wird festgehalten.', ask: 'metadata' },
  { id: 'chunk', label: 'Chunking', text: 'Die Blöcke trennen sich entlang der Struktur. Überschrift und Inhalt bleiben zusammen.', ask: 'chunking' },
  { id: 'meta', label: 'Metadata', text: 'Quelle, Überschriftenpfad, Sichtbarkeit und Fingerprint docken an jeden Chunk an.', ask: 'metadata' },
  { id: 'embed', label: 'Embeddings', text: 'Der Text bleibt. Er bekommt eine zweite, durchsuchbare Ebene: seinen Vektor.', ask: 'embeddings' },
  { id: 'index', label: 'Vector Index', text: 'Die Vektoren ziehen in denselben Knowledge Space, den Vector Search später durchsucht.', ask: 'vectorstore' },
];
