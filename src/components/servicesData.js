export const SERVICES = [
  {
    id: 'webdesign',
    category: 'Webdesign',
    title: 'Websites, die Vertrauen aufbauen.',
    titleLines: ['Websites,', 'die Vertrauen', 'aufbauen.'],
    description:
      'Strategie, Gestaltung und Entwicklung greifen zu einem responsiven Webauftritt zusammen, der Angebote klar erklärt und den nächsten Schritt erleichtert.',
    image: `${import.meta.env.BASE_URL}assets/services/webdesign-entwicklung.jpg`,
    imageWidth: 1774,
    imageHeight: 887,
    imageFit: 'contain',
    imageAlt:
      'Webdesign-Arbeitsplatz mit einer Website und verbundenen CMS- und Frontend-Technologien.',
    heroTitle: 'Pflegbar im Alltag. Individuell in der Wirkung.',
    heroDescription:
      'Ich entwerfe Websites als zusammenhängende Systeme: Struktur, Typografie und Technik entstehen gemeinsam, nicht nacheinander. Ob gepflegtes WordPress-Setup oder individuell entwickelte React-Anwendung, entscheidet dabei das Projekt – nicht die Gewohnheit.',
    closingTitle:
      'Die besten Websites wirken einfach, obwohl im Hintergrund alles total durchdacht ist.',
    closingText:
      'Strategie, Gestaltung und Technik greifen ineinander – damit am Ende nicht ein Effekt auffällt, sondern das Ergebnis.',
  },
  {
    id: 'assistant',
    category: 'KI & Chatbots',
    title: 'Abläufe, die zuverlässig zusammenspielen.',
    titleLines: ['Abläufe, die', 'zuverlässig', 'zusammenspielen.'],
    description:
      'Ein digitaler Assistent beantwortet Fragen, strukturiert Anfragen und übergibt relevante Informationen sauber an Menschen und Systeme.',
    image: `${import.meta.env.BASE_URL}assets/services/ai-assistenten-chatbots.jpg`,
    imageWidth: 1536,
    imageHeight: 1024,
    imageFit: 'contain',
    imageAlt:
      'Chatbot neben einem Smartphone mit Verbindungen zu Termin, E-Mail, Kontakt und Angebot.',
    heroTitle: 'Ein Assistent, der nicht nur antwortet.',
    heroDescription:
      'Er erkennt Absicht, Kontext und offene Fragen – und reagiert erst dann. Genau das unterscheidet eine Textmaschine von einem Assistenten, dem man vertrauen kann.',
    closingTitle:
      'Gute KI erkennt nicht nur die richtige Antwort – sondern auch den Moment, in dem sie keine geben sollte.',
    // Bewusst ohne closingText und ohne ctaLabel: dieses Pop-up endet mit
    // dem Statement allein. ServiceExperience rendert beides nur, wenn es
    // gesetzt ist.
  },
  {
    id: 'api',
    category: 'API Integration',
    title: 'Systeme, die miteinander sprechen.',
    titleLines: ['Systeme, die', 'miteinander', 'sprechen.'],
    description:
      'APIs verbinden Frontends, Backends und externe Dienste zu einem verlässlichen Datenfluss – mit klaren Schnittstellen, kontrollierten Fehlerfällen und nachvollziehbaren Antworten.',
    image: `${import.meta.env.BASE_URL}assets/services/api-integration.jpg`,
    imageWidth: 1672,
    imageHeight: 941,
    imageFit: 'contain',
    imageAlt:
      '3D-Illustration eines zentralen API-Knotens, der Shop, CRM, Zahlung, App, E-Mail, Cloud-Speicher und Auswertung über leuchtende Datenleitungen verbindet.',
    heroTitle: 'Daten sollen fließen – nicht hängen bleiben.',
    heroDescription:
      'APIs verbinden Frontends, Backends und externe Dienste. Entscheidend ist nicht nur, dass Daten ankommen – sondern dass sie zuverlässig, sicher und nachvollziehbar zwischen Systemen fließen.',
    heroTags: ['REST API', 'JSON', 'Webhooks', 'Auth', 'Error Handling'],
    closingTitle:
      'Gute Schnittstellen fallen nicht auf. Sie sorgen einfach dafür, dass alles miteinander funktioniert.',
    closingText:
      'Klare Datenverträge, kontrollierte Fehlerfälle und nachvollziehbare Antworten machen aus einer Verbindung eine belastbare Integration.',
    // Bewusst ohne ctaLabel: der Abschluss endet ruhig mit dem Statement.
  },
  {
    id: 'automation',
    category: 'Automatisierung',
    title: 'Automatisierung, die Arbeit abnimmt.',
    titleLines: ['Automatisierung,', 'die Arbeit', 'abnimmt.'],
    description:
      'Wiederkehrende Übergaben werden zu einem nachvollziehbaren Prozess – mit klaren Auslösern, Zuständen und einem sicheren Weg zurück zum Menschen.',
    image: `${import.meta.env.BASE_URL}assets/services/automatisierung-crm.jpg`,
    imageWidth: 1536,
    imageHeight: 1024,
    imageFit: 'contain',
    imageAlt:
      'Automatisierungsablauf zwischen Formular, CRM, WhatsApp, Termin, E-Mail und Benachrichtigung.',
    heroTitle: 'Wenn Prozesse selbst weiterlaufen.',
    heroDescription:
      'Ein Auslöser startet den Ablauf. Daten werden geprüft, Entscheidungen getroffen und der nächste Schritt folgt von selbst – nachvollziehbar, kontrolliert und mit klaren Grenzen.',
    heroTags: ['Trigger', 'Conditions', 'AI / RAG', 'Actions', 'Monitoring'],
    closingTitle:
      'Ein guter Workflow läuft automatisch – aber nie unkontrolliert.',
    closingText:
      'Klare Auslöser, sichtbare Zustände und definierte Fehlerwege machen aus einzelnen Aktionen einen belastbaren Prozess.',
    // Bewusst ohne ctaLabel: der Abschluss endet ruhig mit dem Statement.
  },
  {
    id: 'seo',
    category: 'SEO & Performance',
    title: 'Sichtbarkeit beginnt unter der Oberfläche.',
    titleLines: ['Sichtbarkeit', 'beginnt unter der', 'Oberfläche.'],
    description:
      'Struktur, verständliche Inhalte und Performance entscheiden mit, ob eine Seite schnell erfasst, sauber eingeordnet und gern genutzt wird.',
    image: `${import.meta.env.BASE_URL}assets/services/seo-performance.jpg`,
    imageWidth: 1536,
    imageHeight: 1024,
    imageFit: 'contain',
    imageAlt:
      'Suchergebnis mit Performance-Diagramm, Ladezeit-Anzeige und SEO-Auswertung.',
    heroTitle: 'Gefunden werden beginnt lange vor Google.',
    heroDescription:
      'Struktur, Inhalte und Performance entscheiden schon vorher, ob eine Website verstanden, schnell geladen und sauber eingeordnet wird.',
    heroTags: ['Struktur', 'Inhalt', 'Performance', 'Indexierbarkeit'],
    closingTitle:
      'Was Menschen verstehen, sollten auch Systeme verstehen können.',
    closingText:
      'Struktur, Performance und klare Inhalte machen Sichtbarkeit zu einer technischen Grundlage – statt zu einem Versprechen.',
    // Bewusst ohne ctaLabel: der Abschluss endet ruhig mit dem Statement.
  },
  {
    id: 'social',
    category: 'Social Media',
    title: 'Inhalte, die Marken relevant machen.',
    titleLines: ['Inhalte, die', 'Marken relevant', 'machen.'],
    description:
      'Eine Kernidee wird plattformgerecht weiterentwickelt – für konsistente Inhalte, einen wiedererkennbaren Auftritt und laufendes Lernen aus Resonanz.',
    image: `${import.meta.env.BASE_URL}assets/services/social-media-content.jpg`,
    imageWidth: 1536,
    imageHeight: 1024,
    imageFit: 'contain',
    imageAlt:
      'Social-Media-Inhalte auf Instagram, TikTok und LinkedIn mit verbundenen Plattformelementen.',
    // Pop-up 6 zeigt statt der Illustration die Journey (SocialExperience).
    hideExperienceMedia: true,
    heroTitle: 'Aufmerksamkeit ist gut. Wirkung ist besser.',
    heroDescription:
      'Kampagnen funktionieren dann, wenn Creative, Marke, Landingpage und Conversion zusammenspielen.',
    closingTitle: 'Gutes Marketing endet nicht mit einer Veröffentlichung.',
    closingText: 'Es beginnt mit dem, was wir daraus lernen.',
    // Bewusst ohne ctaLabel: die Journey endet mit dem Statement.
  },
];
