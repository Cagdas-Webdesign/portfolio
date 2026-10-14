import { CONTACT_MAIL } from '../siteConfig.js';

/*
 * Inhalte von Impressum und Datenschutzerklaerung (angezeigt in LegalModal).
 *
 * Datenschutz: technischer Entwurf auf Basis des tatsaechlichen Datenflusses
 * (Audit 2026-10-13: Frontend dieses Repositorys, Cloudflare Worker und
 * FastAPI-Backend portfolio-rag-backend v1.3.0). Keine Rechtsberatung —
 * vor Veroeffentlichung pruefen und bei Aenderungen am System anpassen.
 */

const PHONE_DISPLAY = '+49 155 65575668';
const PHONE_HREF = 'tel:+4915565575668';

function Address() {
  return (
    <address className="legal-address">
      Çağdaş Uçar<br />
      Johannesstraße 156B<br />
      46238 Bottrop<br />
      Deutschland
    </address>
  );
}

function ContactLines() {
  return (
    <p>
      Telefon: <a href={PHONE_HREF}>{PHONE_DISPLAY}</a><br />
      E-Mail: <a href={`mailto:${CONTACT_MAIL}`}>{CONTACT_MAIL}</a>
    </p>
  );
}

export function ImpressumContent() {
  return (
    <>
      <h3>Angaben gemäß § 5 DDG</h3>
      <Address />

      <h3>Kontakt</h3>
      <ContactLines />
    </>
  );
}

export function DatenschutzContent() {
  return (
    <>
      <p className="legal-meta">Stand: Oktober 2026</p>

      <h3>1. Verantwortlicher</h3>
      <Address />
      <ContactLines />

      <h3>2. Allgemeine Hinweise</h3>
      <p>
        Diese Website ist ein persönliches Portfolio. Sie kommt ohne Benutzerkonto, ohne
        Kontaktformular, ohne Analyse- oder Tracking-Werkzeuge und ohne Werbung aus.
        Personenbezogene Daten fallen nur in dem Umfang an, der für die Auslieferung der Seite,
        die Absicherung des Portfolio Assistant und die von Ihnen selbst ausgelösten Funktionen
        technisch nötig ist. Welche Daten das im Einzelnen sind, beschreiben die folgenden
        Abschnitte.
      </p>

      <h3>3. Hosting des Frontends (GitHub Pages)</h3>
      <p>
        Die Website wird über GitHub Pages bereitgestellt, einen Dienst der GitHub, Inc.,
        88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. Beim Aufruf der Seite
        verarbeitet GitHub technisch notwendige Verbindungsdaten, insbesondere Ihre IP-Adresse,
        Datum und Uhrzeit des Abrufs, die aufgerufene Adresse sowie Angaben zu Browser und
        Betriebssystem. GitHub kann diese Daten zur Sicherheit und zum Betrieb des Dienstes
        protokollieren. Einzelheiten finden Sie in der Datenschutzerklärung von GitHub
        (docs.github.com/site-policy/privacy-policies).
      </p>
      <p>
        Auch alle Schriftarten werden mit der Website von GitHub Pages ausgeliefert. Es werden
        keine Schriften oder Skripte von Schriftart-Diensten Dritter (z. B. Google Fonts) geladen.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in der
        sicheren und zuverlässigen Auslieferung dieser Website.
      </p>

      <h3>4. Portfolio Assistant</h3>
      <p>
        Der Portfolio Assistant beantwortet Fragen zu den Projekten und Fähigkeiten auf dieser
        Website. Er wird nur aktiv, wenn Sie selbst eine Frage eingeben und absenden. Bitte geben
        Sie in das Chatfeld keine personenbezogenen oder sensiblen Informationen ein — der
        Assistent benötigt sie nicht.
      </p>
      <p>Beim Absenden einer Frage geschieht Folgendes:</p>
      <ul>
        <li>
          <strong>Missbrauchsschutz (Cloudflare Turnstile):</strong> Beim Absenden der ersten Frage
          lädt die Seite ein Skript von Cloudflare, das prüft, ob die Anfrage von einem Menschen
          stammt.
          Dabei werden Ihre IP-Adresse sowie technische Merkmale Ihres Browsers und Geräts
          verarbeitet. Das Skript wird nur geladen, wenn Sie den Assistenten tatsächlich nutzen.
        </li>
        <li>
          <strong>Gateway (Cloudflare Worker):</strong> Ihre Frage wird zusammen mit dem
          Prüf-Token an einen Cloudflare Worker gesendet. Er bestätigt das Token bei Cloudflare
          (dabei wird Ihre IP-Adresse mitgeschickt) und begrenzt die Anzahl der Anfragen pro
          IP-Adresse in kurzen Zeitfenstern von 10 und 60 Sekunden. An das Backend leitet er
          ausschließlich Ihre Frage weiter — Ihre IP-Adresse und die Header Ihres Browsers gibt
          er nicht weiter.
        </li>
        <li>
          <strong>Verarbeitung im Backend:</strong> Das Backend läuft auf Google Cloud Run in der
          Region Frankfurt (europe-west3). Es wandelt Ihre Frage über die Mistral AI API
          (Mistral AI SAS, Paris, Frankreich) in einen Suchvektor um, sucht damit passende
          Abschnitte in einer Wissensdatenbank bei Cloudflare Vectorize und lässt aus Frage und
          gefundenen Abschnitten eine Antwort durch Cloudflare Workers AI erzeugen. Anschließend
          wird anhand von Frage, Antwort und zitierten Abschnitten geprüft, ob die Antwort durch
          die Quellen belegt ist. Diese Prüfung übernimmt je nach Konfiguration des Backends
          entweder ebenfalls Cloudflare Workers AI oder ein Sprachmodell über die Groq API
          (Groq, Inc., USA); im zweiten Fall werden diese Daten an Groq übermittelt.
        </li>
        <li>
          <strong>Speicherung:</strong> Mein eigenes Backend speichert weder Ihre Fragen noch die
          Antworten und führt keinen Gesprächsverlauf; es verarbeitet sie nur für die Dauer der
          Anfrage. Der Chatverlauf existiert nur in Ihrem geöffneten Browserfenster und ist nach
          dem Neuladen der Seite verschwunden. Davon zu unterscheiden sind die externen Anbieter
          (Cloudflare, Mistral und gegebenenfalls Groq): Sie verarbeiten die Daten, die ihnen für
          ihren jeweiligen Verarbeitungsschritt übermittelt werden. Ob und wie lange sie diese
          Daten vorhalten, richtet sich nach ihren eigenen Bedingungen.
        </li>
      </ul>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt darin,
        Ihre Frage zu beantworten und den Dienst vor automatisiertem Missbrauch zu schützen. Der
        Zugriff von Cloudflare Turnstile auf Informationen in Ihrem Endgerät erfolgt nach
        § 25 Abs. 2 Nr. 2 TDDDG, weil er für den von Ihnen ausdrücklich gewünschten Dienst
        unbedingt erforderlich ist.
      </p>

      <h3>5. Server-Logs, Request-IDs und Observability</h3>
      <p>
        Jede Anfrage an den Assistenten erhält eine zufällig erzeugte technische Kennung
        (Request-ID). Sie dient dazu, eine Anfrage über alle Verarbeitungsschritte hinweg
        nachvollziehen zu können, Fehler zu analysieren und den stabilen Betrieb zu sichern. Die
        Request-ID enthält keine Angaben zu Ihrer Person.
      </p>
      <p>Das Backend protokolliert pro Anfrage ausschließlich technische Metadaten:</p>
      <ul>
        <li>Zeitpunkt, Request-ID, HTTP-Methode, Pfad, Statuscode und Bearbeitungsdauer,</li>
        <li>
          Ablaufdaten der Antwort (z. B. Anzahl gefundener Abschnitte und Quellen, Ergebnis der
          Prüfung),
        </li>
        <li>
          Angaben zu den Aufrufen der Sprachmodelle (Modellname, Dauer, Anzahl der Tokens,
          Rate-Limit-Angaben des Anbieters, Fehlerkategorie),
        </li>
        <li>bei unerwarteten Fehlern eine technische Fehlermeldung.</li>
      </ul>
      <p>
        Fragetext, Antworttext, die gefundenen Abschnitte und der Inhalt der Anfrage werden nicht
        protokolliert. Zusätzlich erfasst Google Cloud Run automatisch Zugriffsprotokolle
        (Zeitpunkt, Statuscode, Dauer und die aufrufende Adresse — das ist die des
        Cloudflare-Gateways, nicht Ihre). Die Protokolle liegen in Google Cloud Logging und
        werden nach der dort eingestellten Aufbewahrungsfrist automatisch gelöscht.
      </p>
      <p>
        Zusätzlich ist für den Cloudflare Worker die Protokollfunktion von Cloudflare
        (Workers Observability) aktiviert. Cloudflare protokolliert dabei technische Daten der
        Aufrufe des Workers, z. B. Zeitpunkt, aufgerufene Adresse, Statuscode und Laufzeit, und
        löscht sie nach den Vorgaben von Cloudflare nach kurzer Zeit. Der Worker selbst schreibt
        keine Fragen oder Antworten in diese Protokolle.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in der
        Fehleranalyse, der Betriebssicherheit und der Stabilität des Dienstes sowie in der
        Erkennung von Missbrauch.
      </p>

      <h3>6. Beteiligte technische Dienstleister</h3>
      <ul>
        <li>GitHub, Inc. (USA) — Hosting der Website, Abfrage der Release-Version (Abschnitt 7)</li>
        <li>Google Ireland Limited / Google LLC — Google Cloud Run und Cloud Logging (Region Frankfurt)</li>
        <li>Cloudflare, Inc. (USA) — Turnstile, Worker-Gateway, Vectorize, Workers AI</li>
        <li>Mistral AI SAS (Frankreich) — Umwandlung der Frage in einen Suchvektor</li>
        <li>Groq, Inc. (USA) — Prüfung, ob die Antwort durch die Quellen belegt ist, sofern diese Prüfung über Groq konfiguriert ist</li>
      </ul>
      <p>
        Soweit diese Anbieter Daten in meinem Auftrag verarbeiten, geschieht dies auf Grundlage
        ihrer Bedingungen zur Auftragsverarbeitung (Art. 28 DSGVO).
      </p>

      <h3>7. GitHub-Release-Anzeige im Menü</h3>
      <p>
        Wenn Sie das Menü öffnen, fragt Ihr Browser bei der öffentlichen Schnittstelle von GitHub
        (api.github.com) die aktuelle Release-Version der verlinkten Repositorys ab. Dabei
        erhält GitHub Ihre IP-Adresse und übliche Verbindungsdaten. Es wird kein Token und kein
        Konto verwendet. Das Ergebnis wird nur für die Dauer des Seitenbesuchs im Arbeitsspeicher
        Ihres Browsers vorgehalten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (aktuelle
        Angabe der Software-Version).
      </p>

      <h3>8. Cookies und lokaler Speicher</h3>
      <p>
        Diese Website setzt keine eigenen Cookies und verwendet keine Analyse- oder
        Tracking-Technologien. Im lokalen Speicher Ihres Browsers (Local Storage) wird nur dann
        ein Eintrag angelegt, wenn Sie im Assistenten ein Farbschema auswählen: Gespeichert wird
        ausschließlich der Name dieses Schemas, damit es beim nächsten Besuch erhalten bleibt.
        Dieser Eintrag enthält keine personenbezogenen Daten und lässt sich jederzeit über die
        Einstellungen Ihres Browsers löschen. Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG.
      </p>

      <h3>9. Kontakt per E-Mail oder Telefon</h3>
      <p>
        Wenn Sie mich per E-Mail oder Telefon kontaktieren, verarbeite ich Ihre Angaben
        (z. B. Name, E-Mail-Adresse, Telefonnummer, Inhalt der Nachricht) zur Bearbeitung Ihres
        Anliegens. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf einen
        Vertrag zielt, im Übrigen Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h3>10. Speicherdauer</h3>
      <p>
        Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck
        erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Zu den Server-Logs siehe
        Abschnitt 5. Anfragen per E-Mail lösche ich, sobald sie
        erledigt sind und keine Aufbewahrungspflichten entgegenstehen.
      </p>

      <h3>11. Übermittlung in Drittländer</h3>
      <p>
        GitHub, Cloudflare, Google und — soweit eingesetzt — Groq haben ihren Sitz in den USA
        oder verarbeiten Daten auch dort. Eine Übermittlung in die USA erfolgt auf Grundlage des
        Angemessenheitsbeschlusses der EU-Kommission zum EU-US Data Privacy Framework (Art. 45
        DSGVO), soweit der Anbieter danach zertifiziert ist, und andernfalls auf Grundlage von
        Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO).
      </p>

      <h3>12. Ihre Rechte</h3>
      <p>
        Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung
        (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO) und Datenübertragbarkeit
        (Art. 20 DSGVO). Soweit eine Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO beruht, können
        Sie ihr aus Gründen, die sich aus Ihrer besonderen Situation ergeben, widersprechen
        (Art. 21 DSGVO). Wenden Sie sich dazu an die oben genannten Kontaktdaten.
      </p>

      <h3>13. Beschwerderecht</h3>
      <p>
        Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren (Art. 77
        DSGVO). Zuständig für den Verantwortlichen ist die Landesbeauftragte für Datenschutz und
        Informationsfreiheit Nordrhein-Westfalen (ldi.nrw.de).
      </p>

      <h3>14. Änderungen dieser Datenschutzerklärung</h3>
      <p>
        Diese Datenschutzerklärung wird angepasst, wenn sich die Website, der Portfolio Assistant
        oder die eingesetzten Dienste ändern. Es gilt die jeweils hier veröffentlichte Fassung.
      </p>
    </>
  );
}
