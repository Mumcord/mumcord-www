// Hand-written release notes. GitHub's generated notes only list pull requests, so the
// changelog page tells people what changed for them. The date and download link come from
// the matching GitHub release once it is published (see pages/changelog).
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";

export interface ChangeGroup {
  title: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  summary: string;
  // One line for the header menu; falls back to the summary.
  teaser?: string;
  groups: ChangeGroup[];
  known?: string[];
}

const source: Record<"de" | "en", ChangelogEntry[]> = {
  de: [
    {
      version: "0.7.1",
      teaser: "Absturzberichte, die du selbst prüfst und nur auf Wunsch hochlädst, und Kamera-Fixes für Kameras, die vorher kein Bild lieferten.",
      summary: "Ein kleines Update: Schließt sich Mumcord unerwartet, bleibt ein Bericht auf deinem Computer, und gesendet wird er nur, wenn du es willst. Dazu starten mehr Kameras, auch über das Kamera-Portal, und die Hintergrundbilder der Vorschau erscheinen sofort.",
      groups: [
        {
          title: "Neu",
          items: [
            "Absturzberichte: Schließt sich Mumcord unerwartet, speichert es einen kurzen Bericht auf deinem Computer und sagt es dir beim nächsten Start. Darin stehen, was schiefging, welche Funktionen liefen, die Systemdaten und die letzten Logzeilen.",
            "Unter Einstellungen → Erweitert & Entwickler → Absturzberichte siehst du die letzten 10 und kannst sie kopieren, ansehen, exportieren oder löschen.",
            "Einen einzelnen Bericht kannst du an das Mumcord-Team senden. Die Bestätigung zeigt genau, was gesendet wird, und nimmt einen Kommentar an. Ohne „Senden“ geht nichts raus.",
            "Unter Diagnose kopierst du die letzten 200 Logzeilen oder das ganze Log und öffnest den Log-Ordner.",
            "Das Log nennt mehr Ursachen: welche Kameramodi probiert wurden, ob die AppImage H.264 (Twitch) abspielen kann und wann Hintergrundeffekte niemanden im Bild finden.",
          ],
        },
        {
          title: "Behoben",
          items: [
            "Kameras, die einen Modus anbieten, in dem sie nie Bilder senden (zum Beispiel eine Logitech StreamCam mit 720p und 30 fps), starten jetzt: Mumcord probiert eine niedrigere Bildrate oder ein kleineres Bild, statt mit „Die Kamera sendet keine Bilder“ aufzugeben.",
            "Kameras über das Kamera-Portal des Desktops brechen nicht mehr mit „Die Kamera sendet unlesbare Bilder“ ab.",
            "Kameravorschau: Die eingebauten Hintergrundbilder erscheinen sofort, wenn du „Bild“ wählst, statt bei jedem Öffnen kurz leer zu bleiben.",
          ],
        },
      ],
    },
    {
      version: "0.7.0",
      teaser: "Dateien teilen, deine Kamera, Bildschirmübertragung mit Ton und AV1 für bis zu 25 Zuschauer, Plugins im Medienbereich, Kick, Bann und Bannliste.",
      summary: "Ein großes Update: Du teilst Dateien bis 2 GB im Kanal, immer über das Relay, zeigst deine Kamera mit unscharfem Hintergrund, deine Bildschirmübertragung bekommt Ton, AV1 und bis zu 25 Zuschauer, Bild und Chat teilst du dir mit einem Griff auf, Plugins bekommen den Medienbereich und klare Sicherheitsregeln, und Admins können Leute vom Server werfen, bannen und die Bannliste pflegen.",
      groups: [
        {
          title: "Dateien teilen",
          items: [
            "Dateien und Ordner in den Chat ziehen oder über die Büroklammer anhängen, bis 2 GB. Gibt es das Relay nicht oder erlaubt es keine Dateien, sagt die Büroklammer warum.",
            "Dateien gehen immer über das Relay des Servers: Niemand sieht deine IP-Adresse, und die Datei berührt den Mumble-Server nie.",
            "Jeder Download fragt vorher und zeigt den Ordner, in den gespeichert wird. Danach prüft Mumcord, ob die Datei unverändert angekommen ist.",
            "Programme und Skripte bekommen eine zusätzliche Warnung vor dem Download und vor dem Öffnen.",
            "Deine geteilten Dateien zeigen, wer sie geladen hat, und haben einen Knopf „Nicht mehr teilen“.",
            "Bilder, die du in einen Kanal ziehst, schickst du als Bilder oder teilst sie als Dateien. Alle anderen Dateien werden gleich geteilt.",
            "Neu in Einstellungen → Privatsphäre & Verbindungen: Dateien empfangen an oder aus, die maximale Größe von 100 MB bis 2 GB und der Ordner für empfangene Dateien.",
          ],
        },
        {
          title: "Bildschirmübertragung",
          items: [
            "Ton beim Teilen: Der ganze Bildschirm teilt allen Ton außer Mumcord, ein Fenster nur den Ton dieser App. Das geht unter Windows 10 (ab 2004), macOS 13 und Linux mit PipeWire.",
            "Vor dem Start wählst du Auflösung, Bildrate, scharfen Text oder flüssige Bewegung, Codec und Upload-Limit. Im Qualitätsmenü änderst du das während der Übertragung, ohne neu zu starten.",
            "Mumcord wählt den Encoder selbst: AV1 auf der Grafikkarte, AV1 im Prozessor oder VP9. Die Leiste deiner Übertragung zeigt Qualität, Encoder und ob sie über das Relay geht.",
            "Teilst du ein Fenster, fragt „Welche App soll zu hören sein?“, wessen Ton mitgeht. Du kannst auch „Kein Ton“ wählen.",
            "Über das Relay lädst du nur einmal hoch, und bis zu 25 Leute schauen zu, Ende-zu-Ende-verschlüsselt.",
            "AV1 auf der Grafikkarte oder im Prozessor für scharfen Text bei weniger Bandbreite. VP9 bleibt als Rückfall, auch für Zuschauer mit älterem Mumcord.",
            "Zuschauer sehen Codec, Weg und Qualität und können ihre Bildrate senken. Die Liste der Zuschauer zeigt, wer was bekommt.",
            "Neuer Tab „Bildschirmübertragung“ in den Einstellungen mit deinen Standardwerten und dem Encoder deines Computers.",
            "Bild und Chat teilst du dir selbst auf: Ziehe den Griff zwischen Bildschirmübertragung oder Watch-Party und Chat. Ganz nach oben gezogen wird das Bild zur Mini-Leiste, und Mumcord merkt sich die Höhe.",
          ],
        },
        {
          title: "Kamera",
          items: [
            "Deine Kamera für alle in deinem Sprachkanal, nur über das Relay und Ende-zu-Ende-verschlüsselt.",
            "Der Kameraraum steht über dem Chat: bis zu neun Kacheln im Raster oder das Layout „Sprecher“ mit einer großen Kachel. Jede zeigt den Namen, ein Mikrofon-aus-Symbol und einen grünen Rahmen, wenn die Person spricht.",
            "Die Kamera startet mit einer Vorschau, die niemand sonst sieht. Du wählst die Kamera und den Hintergrund, gesendet wird erst, wenn du sie einschaltest.",
            "Hintergrund: keiner, unscharf (leicht oder stark), eines von 18 Bildern aus Mumcord oder dein eigenes. Berechnet wird er auf deinem Computer, und du wechselst ihn auch während die Kamera läuft.",
            "Das ⋯ an einer Kachel bietet „Für mich anheften“, „Groß zeigen“, „Video von … ausblenden“ (dann wird es gar nicht geladen) und „Qualität für mich“. Alles geht auch mit der Tastatur.",
            "Neben einer Bildschirmübertragung oder Watch-Party bleibt das Bild groß, und die Kameras stehen als Streifen daneben oder darüber. Oder du blendest sie aus, dann werden sie nicht geladen.",
            "Ein Kamera-Knopf in der Benutzerleiste und „Kamera einschalten“ im Apps-Menü öffnen die Vorschau. Läuft die Kamera, wird der Knopf rot, und ein Kamera-Symbol steht im Kanalbaum.",
            "Neuer Tab „Kamera“ in den Einstellungen: Vorschau, Kamera, Sendequalität, gespiegelte Eigenansicht, Standard-Hintergrund und wie du die Kameras anderer siehst. Dazu ein Tastenkürzel zum Ein- und Ausschalten.",
            "Läuft die Kamera, zeigt das Tray-Symbol ein rotes Kamera-Abzeichen und im Menü „Kamera ausschalten“. Sperrst du den Bildschirm, kann sich die Kamera von selbst ausschalten.",
            "Geht die Kamera nicht oder hört sie von selbst auf, sagt Mumcord warum, etwa wenn das Relay des Servers keine Kameras erlaubt.",
          ],
        },
        {
          title: "Plugins",
          items: [
            "Plugins bekommen den Medienbereich, eine Seitenleiste neben dem Chat, Dialoge und Einträge im Apps-Menü. Läuft mehr als eines, wechselst du mit Tabs.",
            "Spieldaten gehen Ende-zu-Ende-verschlüsselt über das Relay, für eine Person oder den ganzen Kanal.",
            "Ein Sicherheits-Score von 0 bis 100 für inoffizielle Plugins, mit seinen Gründen bei der Installation und bei Updates.",
            "Jede Website, mit der ein Plugin spricht, steht bei der Installation da, und neue Websites brauchen deine Zustimmung.",
            "Plugin-Seiten laufen abgeschottet: keine Kamera, kein Mikrofon, keine Zwischenablage und nur die Websites, die du erlaubt hast. Eine hängende Seite friert Mumcord nicht mehr ein.",
            "Ein Plugin, das ein neueres Mumcord braucht, sagt das, statt sich zu installieren, und Updates warten, bis dein Mumcord passt.",
            "Jedes Plugin kann bis zu zwei Einträge im Apps-Menü haben, unter „Plugins“ mit Symbol und Name. Dieselben Einträge stehen in der Befehlspalette (Strg+Umschalt+P).",
            "Plugins können kurze Töne abspielen, die nur du hörst. Sie sind leiser, solange jemand spricht, und still, wenn du taub geschaltet bist.",
            "Ein Plugin kann eine Datei speichern, ein Bild öffnen oder ein Bild in den Chat stellen, aber nur direkt nach deinem Klick und mit Erlaubnis. Es erfährt nie, wo deine Dateien liegen.",
            "Einstellungen → Plugins zeigen, wie viele Daten jedes Plugin über das Relay schickt, haben einen Schalter „Plugin-Sicherheit“ gegen riskante Plugins und listen Plugins, die beim Laden abgelehnt wurden.",
            "Beim Update-Check siehst du den Sicherheits-Score vorher und nachher und warum ein Update wartet. Gibt es Release-Notizen, öffnet „Was ist neu“ sie im Browser.",
          ],
        },
        {
          title: "Admin",
          items: [
            "Kick… und Bann… im Admin-Menü einer Person, mit Grund. Banns gelten für 1 Stunde, 1 Tag, 7 Tage, 30 Tage, für immer oder bis zu einem Datum.",
            "Die Bannliste im Server-Menü: durchsuchen, filtern, Grund und Ende bearbeiten, Banns aufheben und auch Leute bannen, die gerade nicht online sind.",
          ],
        },
        {
          title: "Bots",
          items: [
            "Bots stehen für sich: ein Abschnitt „Bots auf diesem Server“ unter der Kanalliste zeigt jeden Bot mit dem, was er kann. Bots ohne Stimme tauchen nicht mehr zwischen den Leuten auf.",
            "Ein Mumbot heißt in Profil und Verbindungsdetails „Mumbot <Version>“ statt „Mumcord <Version>“.",
          ],
        },
        {
          title: "Verbessert",
          items: [
            "Der Chatverlauf zwischen Leuten mit 0.7.0 holt sich schneller nach: Jedes Bild kommt einmal, und Bilder, die du schon hast, lädt Mumcord nicht neu.",
            "Mumcord hält sich an das, was das Relay des Servers erlaubt, und die Server-Infos zeigen, was das ist.",
            "Schalter bleiben im Hochkontrastmodus sichtbar.",
            "Das Apps-Menü zeigt Symbole für „Bildschirm teilen“ und „Zusammen schauen“, und Plugins ohne Symbol bekommen eine eigene farbige Kachel.",
            "Die Latenzkarte sagt, warum die Zeit länger ist als der Niedrig-Latenz-Modus will, etwa wenn der Tonserver unter Linux größere Blöcke braucht.",
          ],
        },
        {
          title: "Behoben",
          items: [
            "Auf älteren Prozessoren ohne AVX2 stürzt Mumcord beim Start nicht mehr ab. Die Bildschirmübertragung nimmt dort VP9.",
            "Der Chatverlauf gesperrter Kanäle geht nur noch an Leute, die wirklich im Kanal sind, nicht an Leute, die ihm nur folgen oder zuhören.",
            "Wer „Immer über das Relay“ nutzt, bekommt deine Netzwerkadresse nicht mehr geschickt.",
            "Ein Profil von einem neueren Mumcord führt nicht mehr zum Absturz. Mumcord erklärt es und bietet den Download der neuesten Version an.",
            "Gesendete Nachrichten stehen gleich und dauerhaft an der richtigen Stelle im Verlauf.",
            "Ein Mittelklick auf einen Link, oder ein Klick mit Strg, Cmd oder Umschalt, öffnet ihn im Browser statt in Mumcord.",
            "Wer auf einem Server nicht registriert ist, dessen Relay nur Registrierte bedient, bekommt das jetzt so gesagt statt „Relay nicht erreichbar“.",
            "Kick und Bann reagieren auf Mausklicks.",
            "Eine Watch-Party aus dem Apps-Menü lädt die App nicht mehr neu.",
            "Die Bildschirmübertragung spricht jetzt alle Sprachen.",
            "Der Ton ruckelt nicht mehr, wenn eine andere App gleichzeitig Ton abspielt.",
            "Endet eine Bildschirmübertragung, die du schaust, bleibt kein leeres Bild zurück, und die Kameras gehen zurück in den Raster.",
            "Strg+C auf markiertem Chattext lässt die Zwischenablage unter Linux (X11) nicht mehr leer.",
            "Ein Plugin kann seinen Dialog nicht mehr von selbst öffnen, nur kurz nach deinem Klick. Nachrichten einer Plugin-Seite kommen in der richtigen Reihenfolge an.",
          ],
        },
      ],
    },
    {
      version: "0.6.2",
      teaser: "Schnellere Fenster im Linux-AppImage, „Was ist neu“ zeigt die richtige Version, und kleine Korrekturen.",
      summary: "Ein kleines Update: Im Linux-AppImage öffnen sich Fenster viel schneller, „Was ist neu“ zeigt die Notizen deiner Version und bleibt nicht mehr beim Laden hängen, und die Plugin-Leiste und das Menü am Auflegen-Knopf sitzen wieder richtig.",
      groups: [
        {
          title: "Verbessert",
          items: [
            "Linux-AppImage: Das Hauptfenster und weitere Fenster wie „Was ist neu“ und der Paketinspektor öffnen sich viel schneller.",
          ],
        },
        {
          title: "Behoben",
          items: [
            "„Was ist neu“ öffnet mit den Notizen der Version, die du gerade nutzt, gefolgt von den älteren. Notizen neuerer Versionen tauchen nicht mehr auf.",
            "„Was ist neu“ bringt seine Notizen mit und bleibt nicht mehr beim Laden hängen.",
            "Die Plugin-Symbole in der Leiste unter der Kanalliste sitzen mittig und sind größer.",
            "Das Menü am Auflegen-Knopf öffnet sich über dem Knopf, statt unten aus dem Fenster zu laufen, und der Eintrag zum Wechseln des Sprachservers hat ein Symbol.",
          ],
        },
      ],
    },
    {
      version: "0.6.1",
      teaser: "Plugins auf dem Mac, eigene Lautstärke für Bildschirmübertragungen, feste Menühintergründe und „Klassisch“ als Standardklang.",
      summary: "Ein kleines Update nach 0.6.0: Plugins laufen jetzt auch auf dem Mac, eine Bildschirmübertragung hat ihre eigene Lautstärke, Menüs und Karten haben einen festen Hintergrund, und neue Installationen starten mit dem Klangthema „Klassisch“. Unter Windows sind App und Installer jetzt signiert.",
      groups: [
        {
          title: "Verbessert",
          items: [
            "Neue Installationen starten mit dem Klangthema „Klassisch“. Wer schon „Reich“ gewählt hat, behält es (#339).",
            "Kontextmenüs, Popovers, Hover-Karten und die Profilkarte haben einen festen Hintergrund statt Milchglas. So bleibt Text auch dort gut lesbar, wo der Weichzeichner fehlt, etwa unter Linux (#337).",
            "Windows: App und Installer sind jetzt mit einem Code-Signing-Zertifikat signiert (#340).",
          ],
        },
        {
          title: "Behoben",
          items: [
            "Die Lautstärke einer Bildschirmübertragung ändert nicht mehr die Stimme der Person. Beide haben ihren eigenen Regler, und Mumcord merkt sich beide pro Person (#333).",
            "macOS: Mumcord stürzt nicht mehr ab, sobald ein Plugin startet, etwa die Echolinge.",
          ],
        },
      ],
    },
    {
      version: "0.6.0",
      teaser: "Plugins: Umfragen, Würfel, Echolinge, Mumbot Music und EVE Fit, sicher in einer Sandbox und ohne Änderung am Server.",
      summary: "Mumcord bekommt Plugins: kleine, sichere Extras, installiert aus den Einstellungen, abgeschottet in einer Sandbox und ohne Änderung am Server. Zum Start gibt es Umfragen, faire Würfel, die Echolinge, eine Fernbedienung für den Mumbot-Musikbot und EVE Fit. Dazu ein neues Klangthema, ein Abschiedston und ein schnellerer Start mit Startbildschirm.",
      groups: [
        {
          title: "Neu",
          items: [
            "Plugins: kleine Erweiterungen, die Mumcord neue Funktionen geben. Einstellungen → Plugins hat die Reiter Installiert, Durchsuchen, Updates, Repositories und im Entwicklermodus Entwickler. Nichts ist vorinstalliert, Plugins laufen auch ohne Serververbindung, und „Plugins“ steht auch in der Befehlspalette.",
            "Vor jeder Installation zeigt Mumcord in klaren Worten, was ein Plugin tun will: jede Berechtigung grün, gelb oder rot, nötige fest, optionale als Schalter. Berechtigungen lassen sich später ändern und gelten sofort. Deinen Chat, deine Dateien, dein Mikrofon, Zertifikate und Passwörter bekommt ein Plugin nie.",
            "Installieren und Aktualisieren zeigen einen Fortschrittsbalken mit Größe, dann „Signatur prüfen“, „Entpacken“ und „Starten“; ein fehlgeschlagener Download lässt sich wiederholen.",
            "Plugins erscheinen, wo du Mumcord benutzt: eine Plugin-Leiste unter der Kanalliste, Karten im Chat, Slash-Befehle wie /roll, ein kleines Abzeichen neben Namen, ein Bereich in Profilkarten, Einträge im Rechtsklick-Menü einer Person und eigene Fenster. Nachrichten eines Plugins sind mit „via“ markiert.",
            "Eine Plugin-Karte ersetzt die Chatnachricht, zu der sie gehört, etwa ein eingefügtes Fitting oder eine Umfrage. Ersetzte Nachrichten zeigen Icon und Name des Plugins, und „Originaltext anzeigen“ holt sie zurück. Ältere Nachrichten bekommen ihre Karten auch, ohne dass Stimmen doppelt zählen.",
            "Ein Plugin kann bestimmte Chatnachrichten erkennen, etwa ein eingefügtes Spiel-Fitting. Die Installation sagt in den Worten des Plugins, was es erkennt; es bekommt dann nur passende Nachrichten in deinem Kanal, nie von Leuten, die du blockiert hast, und sonst keinen Chattext.",
            "Plugins tauschen Daten mit demselben Plugin bei anderen im Kanal aus, etwa für eine gemeinsame Umfrage. Das läuft über den normalen Sprachserver: Standard-Mumble-Server brauchen nichts, andere Clients ignorieren es, und du bestimmst, wer es sieht. Plugin-Funktionen im Chat laufen auf jedem verbundenen Server.",
            "Plugins können Benachrichtigungen schicken. Sie landen in der Benachrichtigungszentrale unter „Plugins“, lassen sich pro Plugin abschalten und schweigen bei „Nicht stören“.",
            "Plugin-Updates haben eine eigene Einstellung: automatisch (Standard), nur benachrichtigen oder aus. Ein Update, das mehr Rechte will oder von jemand anderem kommt, wartet immer auf dein Okay; startet ein Plugin nach einem Update nicht, geht es zurück; und jedes Plugin lässt sich auf seine Version festpinnen. Neue optionale Rechte bleiben aus und werden unter Updates angeboten.",
            "Server können Plugins empfehlen: Der Mumbot eines Servers schlägt Plugins vor, die in der Benachrichtigungszentrale erscheinen, mit Installieren, Details, Nicht jetzt und Für diesen Server nicht mehr fragen. Ohne dein Okay wird nichts installiert.",
            "Eigene Repositories: bis zu zehn in Einstellungen → Plugins → Repositories, mit Name und Schlüssel-Fingerabdruck. Ihre Plugins sind überall „Inoffiziell“, die erste Installation warnt, und ändert sich der Signaturschlüssel, pausiert das Repository, bis du bestätigst.",
            "Der Entwicklermodus (Einstellungen → Erweitert) bringt den Reiter Entwickler: ein Plugin aus einem Ordner laden, neu laden und entladen, mit Log. Für Autoren gibt es das Plugin-SDK, eine Vorlage und das Kommandozeilen-Tool mumcord-plugin auf crates.io (cargo install mumcord-plugin).",
            "Links mit mumcord://plugins/<id> öffnen die Details eines offiziellen Plugins; installiert wird dabei nie etwas.",
            "Die offiziellen Plugins, jedes in allen 24 Sprachen: Umfrage (2 bis 10 Antworten, Live-Ergebnis, eine Stimme pro Person), Würfel (/roll mit d20, 2d6+3, Vorteil und Nachteil, gemeinsam gewürfelt und geprüft), Echolinge (ein Wesen mit 5 Arten, 4 Stufen und 3 Farben, das nie stirbt und nichts verkauft, mit zwei Minispielen), Mumbot Music (was läuft, Überspringen, Lautstärke, Warteschlange, Titel hinzufügen; Rechtsklick auf den Bot → „Bot einrichten“) und EVE Fit (Schiffskarte und Fitting-Rad für eingefügte EVE-Online-Fittings).",
            "Mumbot stellt sich Mumcord vor: Mumcord weiß, welche Nutzer Bots sind und was sie können, und „Bot einrichten“ erscheint nur bei Bots mit Musik.",
            "Sicherheit: Plugins laufen in einer abgeschotteten Sandbox mit Grenzen für Speicher und Zeit. Eins, das ständig abstürzt, wird abgeschaltet, und deine Sprache bleibt unberührt. „Alle Plugins ausschalten“ (Einstellungen und Befehlspalette) stoppt alle auf einmal, und mumcord --no-plugins startet ganz ohne. Offizielle Plugins sind signiert und werden bei der Installation und nach jedem Update geprüft; ein Notschalter kann ein schädliches Plugin abschalten und wird täglich geprüft.",
            "Privatsphäre: Die Suche nach Plugins schickt keine Kennungen und keine Liste deiner Plugins. Plugin-Daten bleiben auf deinem Rechner, und nach dem Entfernen 30 Tage lang, wenn du sie nicht löschst.",
            "Ein zweites Klangthema: „Reich“ mit neuen, volleren Tönen für Verbinden, Nachrichten, Erwähnungen, Stummschalten, Kommen und Gehen, Kick und Bann ist jetzt der Standard. Einstellungen → Töne wechselt mit Vorschau zu „Klassisch“, den vertrauten kurzen Tönen (#325).",
            "Beendest du Mumcord mitten im Sprachkanal, verabschiedet es sich mit einem kurzen Ton, damit du merkst, dass du raus bist. Er spielt nur beim echten Beenden, nie beim Minimieren in den Tray, und hat einen eigenen Schalter (#325).",
            "Ein Kanalwechsel im Sprachkanal hat seinen eigenen kurzen Ton statt des Verbindungstons, mit eigenem Schalter und in beiden Klangthemen (#325).",
          ],
        },
        {
          title: "Verbessert",
          items: [
            "Mumcord startet schneller: Der Code vor dem ersten Bild ist etwa ein Drittel kleiner. Einstellungen, Einrichtungsassistent, Zusammen schauen, Bildschirm teilen, Serverbrowser und Codehervorhebung laden erst, wenn du sie öffnest (#323).",
            "Statt eines leeren weißen Fensters und „Laden …“ kommt ein Startbildschirm: das Logo auf deinem Theme mit einem schmalen Ladebalken, der ins Programm überblendet; mit reduzierter Bewegung ohne Animation (#323).",
            "Der Eintrag „Plugins“ in der Einstellungsleiste zeigt, wie viele Updates und neue optionale Rechte warten.",
            "Höhere Plugin-Karten bekommen keinen eigenen Scrollbalken mehr: Sie werden weich abgeschnitten, und „Mehr anzeigen“ klappt sie auf.",
            "Screenreader lesen eine ersetzte Chatzeile als Karte vor (etwa „Karte von Umfrage: Mittag um zwölf?“) und überspringen versteckte Zeilen.",
          ],
        },
        {
          title: "Behoben",
          items: [
            "Einfügen mit Strg+V geht auf einigen Linux-Desktops wieder.",
            "Der Link „Ändern“ in der Karte „Aktives Preset“ der Einstellungsleiste ragt bei langen Namen nicht mehr aus der Karte (#321).",
            "Das Zahlenfeld für gleichzeitig verbundene Server in Einstellungen → Server ist nicht mehr über die ganze Karte gestreckt (#320).",
            "In Dialogen, die ihren Inhalt wechseln, bleibt der Fokus im Dialog, sodass Escape und Tab weiter funktionieren.",
            "Eine Profilkarte, die du direkt nach einem Knopfdruck darin mit Escape schließt, öffnet sich danach wieder.",
          ],
        },
      ],
    },
    {
      version: "0.5.0",
      teaser: "Benachrichtigungszentrale, alle privaten Nachrichten an einem Ort, Blockieren, mehrere Identitäten und Import aus Mumble.",
      summary: "Ein großes Update für Chat und Privatsphäre: eine Benachrichtigungszentrale, alle privaten Nachrichten an einem Ort mit deinen eigenen Regeln, wer dir schreiben darf, Blockieren, mehrere Identitäten und der Umzug aus Mumble mit wenigen Klicks. Dazu ein Community-Relay für Bilder und Bildschirm teilen, Musik und Audio im Chat, ein Browser für öffentliche Server und ein Modus mit niedriger Latenz zum gemeinsamen Musikmachen.",
      groups: [
        {
          title: "Neu",
          items: [
            "Eine Benachrichtigungszentrale hinter der Glocke im Chat-Kopf (Strg+Umschalt+N) sammelt alles, was deine Aufmerksamkeit will, von allen verbundenen Servern: Erwähnungen, Antworten, Chat- und Nachrichtenanfragen mit Annehmen und Ablehnen, Einladungen zu Watch-Partys und Bildschirmfreigaben und Server, die nicht mehr erreichbar sind. Ein Klick springt zur Nachricht.",
            "„Nicht stören“: Ein Schalter in den Schnelleinstellungen, den Einstellungen und im Tray-Menü schaltet Benachrichtigungstöne und -fenster auf allen Servern stumm. Sprache läuft weiter, ungelesene Nachrichten werden weiter gezählt. Auf Wunsch folgt Mumcord dem „Nicht stören“ des Systems, unter KDE Plasma, GNOME und Windows.",
            "Das Tray-Menü zeigt jeden verbundenen Server mit Kanal, dazu Stummschalten, Taubschalten und „Nicht stören“. Von dort wechselst du mit der Sprache auf einen anderen Server oder Kanal und öffnest deine letzten privaten Chats. Das Tray-Symbol zeigt, wenn jemand spricht, du stumm bist oder Nachrichten ungelesen sind.",
            "Alle privaten Nachrichten an einem Ort: Der Knopf „Nachrichten“ oben in der Serverleiste listet jede Unterhaltung von jedem verbundenen Server, mit Suche, Filtern, Anheften und Stummschalten. Er ersetzt die Liste „Direktnachrichten“ unter dem Kanalbaum. Das Menü einer Person beginnt jetzt mit Nachricht senden, Kanal beitreten und Freund hinzufügen.",
            "Du bestimmst, wer dir privat schreiben darf: alle, nur Freunde oder niemand, auf Wunsch pro Server. Leute in deinem Kanal und Unterhaltungen, die du angenommen hast, kommen immer durch. Andere landen unter „Nachrichtenanfragen“, und Mumcord-Nutzer können dir eine Chatanfrage mit kurzer Notiz schicken. Mumcord filtert bei dir, der Absender erfährt davon nichts. Eine angenommene Unterhaltung kannst du später wieder zurücknehmen.",
            "Leute blockieren: Ihre privaten Nachrichten und Anfragen verschwinden, ihre Nachrichten im Kanal werden eingeklappt, und ihre Stimme ist für dich stumm. Die Sperre hängt am Zertifikat der Person, gilt also auf jedem Server, und ein neuer Name hilft nicht. Weder Server noch Person erfahren davon; Einstellungen → Datenschutz listet alle Sperren.",
            "@channel und @all erreichen alle in einem Kanal und zählen wie eine persönliche Erwähnung. Andere Mumble-Clients sehen einfach die Wörter, und pro Server lassen sie sich stummschalten.",
            "Audio und Musik im Chat: Direkte Links zu Audiodateien wie mp3, ogg, wav oder flac bekommen einen kleinen Player. Links zu Spotify, SoundCloud und YouTube Music spielen im Player des Dienstes, sobald du auf Play drückst; Apple Music, Tidal, Deezer und Bandcamp bekommen eine Karte mit Link. Nichts spielt von selbst, und ohne Link-Vorschauen wird nichts geladen.",
            "Links mit mumble:// im Chat zeigen eine Karte mit Server, Kanal, Ping und wie viele online sind, mit Beitreten und Zu Servern hinzufügen. Ein Passwort im Link wird nie angezeigt.",
            "Kanäle besser im Griff: Ein Rechtsklick auf einen Kanal öffnet ein Menü mit Beitreten, Folgen, Kanallink kopieren, Kanalinfo und mehr. Kanäle zeigen ihr Limit, etwa Raid (1/10), volle sind abgeblendet. Mit dem passenden Recht ziehst du Leute in einen anderen Kanal. Die Kanalinfo zeigt Beschreibung, Leute, deine Rechte und verlinkte Kanäle.",
            "Modus für niedrige Latenz zum gemeinsamen Musikmachen (Beta): etwa 40 statt 100 Millisekunden vom Mund bis zum Ohr, plus Netzwerk. Er schaltet ohne Neuverbinden um und läuft mit normalen Servern. Kopfhörer empfohlen.",
            "Audio pro Kanal: „Audio für diesen Kanal…“ gibt einem Kanal eigene Einstellungen, mit den Vorlagen Sprache, Musik und Jam. Sie gelten, sobald du beitrittst, und beim Verlassen kommen deine normalen Einstellungen zurück.",
            "Schnellmenüs in der Sprachleiste: Rechtsklick auf Mikrofon oder Kopfhörer für Geräte, Lautstärke und Pegelanzeige, auf die Verbindungsinfo für Sprachqualität und Bitrate, auf Auflegen für „Sprache verlassen“ (verbunden bleiben und weiter chatten) oder „Von allen Servern trennen“.",
            "Ein Server-Browser in der Serverleiste listet öffentliche Mumble-Server, mit Suche und Filtern nach Land und Ping. „Verbinden“ speichert und verbindet mit einem Klick. Die Liste lädt nur, wenn du den Browser öffnest.",
            "Der Server-Dialog ist in vier Tabs geordnet und hat „Verbindung testen“, das Ping, Serverversion und Zertifikat prüft, ohne etwas zu speichern. Die Server-Info zeigt Version, Grenzen, deine Rechte und das TLS-Zertifikat. Gespeicherte Kanalpasswörter zeigen, zu welchem Kanal sie gehören.",
            "Mehrere Identitäten: Einstellungen → Identität verwaltet mehrere Zertifikate, mit Import, Export, Umbenennen und einem Standard. Jeder Server kann seine eigene Identität nutzen. Deine bisherige heißt dann „Standard“, und alles verbindet sich wie gewohnt.",
            "Aus Mumble importieren: Ist der offizielle Mumble-Client installiert, übernimmt der Einrichtungsassistent (oder Einstellungen → Server) deine Lieblingsserver, gespeicherte Passwörter, dein Zertifikat, die Audiogeräte und die Push-to-Talk-Taste. Nichts wird überschrieben, Mumbles Dateien werden nur gelesen, und der Import lässt sich rückgängig machen.",
            "Community-Relay: Bilder in voller Größe und Bildschirm teilen können über ein Relay laufen, das die Community eines Servers neben ihrem Mumble-Server betreibt. Es reicht nur die verschlüsselte Verbindung weiter und verbirgt auf Wunsch deine IP-Adresse vor der anderen Person. Bildschirm teilen klappt damit auch ohne direkte Verbindung. Sprache läuft nie über das Relay.",
            "Unter Windows gibt es Mumcord auch als portables Zip: auspacken, starten, ohne Installation. Daten und Einstellungen bleiben im Ordner neben dem Programm.",
            "Die Mitgliederspalte lässt sich ausblenden, damit der Chat die volle Breite bekommt: per Knopf im Chat-Kopf oder Strg+Umschalt+M. Im schmalen Fenster schiebt sie sich über den Chat.",
            "Gekickt oder gebannt? Mumcord spielt dazu einen Ton: eine Ohrfeige beim Kick, einen Slapstick-Tritt beim Bann. Beide lassen sich abschalten.",
            "Die Server-Info zeigt, ob der Server ein Relay oder einen Mumbot ankündigt, und warnt, wenn sich das Relay geändert hat.",
            "Flüstern und Rufen: Sprich mit ausgewählten Leuten oder mit allen in einem Kanal, ohne dorthin zu wechseln, mit eigener Taste pro Ziel und einem Banner über dem Chat, das zeigt, mit wem du sprichst.",
            "Updates in der App: Mumcord sucht nach neuen Versionen, zeigt, was sich geändert hat, und installiert sie mit einem Klick. Jeder Download wird gegen Signatur und Prüfsummen geprüft.",
            "Rauschunterdrückung in vier Stufen: Leicht, Standard, Erweitert (KI, Beta, mit dem RNNoise-Modell von 2024) und Aus, jede mit einem „?“ erklärt.",
            "Globale Tastenkürzel unter Einstellungen → Tastenkürzel: neben Push-to-Talk Tasten für Stumm, Taub, „Nicht stören“, Sprachkanal betreten und verlassen, Server oder Kanal wechseln, die Mitgliederspalte, die Schnelleinstellungen und Mumcord öffnen. Ab Werk ist nichts belegt, und eine schon vergebene Taste lässt sich mit einem Klick umlegen.",
            "Watch Together öffnet eine Kinoansicht: den Player mit dem Kanalchat darunter, Steuerung auf dem Bild und eine Liste, die zeigt, wer synchron ist, puffert oder hinterherhängt. Verlässt du sie, bleibt ein Mini-Player oben im Chat.",
            "Die Bildschirmfreigabe ist in die Hauptspalte gezogen, mit Auflösung, Bildrate und „Stream-Details“. Wer teilt, bekommt oben im Chat eine Steuerleiste mit Pause, Ton, Fenster wechseln, Zuschauern und Beenden.",
            "„Chat-Freigabe zurückziehen…“ im Personenmenü und in der Übersicht der privaten Nachrichten: Danach braucht die Person eine neue Nachrichtenanfrage, bevor ihre Nachrichten dich wieder erreichen.",
          ],
        },
        {
          title: "Verbessert",
          items: [
            "Das Benutzerfeld unter der Kanalliste ist neu gestaltet: Es bleibt in jedem Zustand gleich hoch, damit die Liste darüber nicht springt, zeigt eine klare Statuszeile und hat an jedem Sprach-Knopf einen kleinen Menüpfeil.",
            "Die Schnelleinstellungen sind ruhiger: eine Zeile pro Einstellung in klaren Gruppen, Erklärungen hinter einem kleinen ?, und die Beta-Gruppe startet eingeklappt.",
            "Sind Link-Vorschauen aus, verschwinden sie nicht mehr stillschweigend: Eine leise Zeile unter der Nachricht sagt, was ausgeblendet ist, und führt zur passenden Einstellung.",
            "„Einrichtung erneut ausführen“ unter Einstellungen → Über geht die Einrichtung noch einmal durch. Deine Identität bleibt unangetastet, und gespeichert wird nur, was du änderst.",
            "Der Paketinspektor folgt neuen Paketen, hält an, wenn du nach oben scrollst, und zeichnet nur auf, solange er offen ist.",
            "Der Server- und Kanalbaum ist standardmäßig ein Viertel breiter, damit längere Kanalnamen passen. Selbst eingestellte Breiten bleiben.",
            "Einstellungen und Einrichtungsassistent sind neu gestaltet: zehn Gruppen mit Abschnittskarten, eine Suche, die auch Beschreibungen und Synonyme findet, Markierungen für Beta, Geändert und Empfohlen sowie „Abschnitt zurücksetzen“. Der Assistent bietet Einrichtungsstile, die sinnvolle Entscheidungen auf einmal treffen, und die Sprache wählst du aus einer durchsuchbaren Liste.",
            "Der Kanalkopf ist aufgeräumter: Ein Auge vor dem Kanalnamen zeigt, ob du dem Kanal folgst, und schaltet es um. Der Name öffnet ein Menü mit Kanallink kopieren, Kanalpasswort…, Kanalinfo und Chatverlauf leeren….",
            "Das Personenmenü beginnt mit Nachricht senden, ‹Kanal› beitreten und Freund hinzufügen; Beitreten sagt, warum es nicht geht, wenn der Kanal voll oder gesperrt ist.",
            "Ein neues Mumcord-Logo: ein M aus zwei Personen, eine mit Cap und eine mit Mütze.",
          ],
        },
        {
          title: "Behoben",
          items: [
            "Deine eigenen Nachrichten spielen nie mehr den Erwähnungston, zeigen keine Benachrichtigung und zählen nicht als ungelesen.",
            "Die Watch-Party hält sich an „Linkvorschauen und eingebettete Videos anzeigen“: Ist es aus, wird nichts von YouTube oder Twitch geladen, und ein Hinweis führt zur Einstellung.",
            "Linux mit PipeWire: Die Gerätelisten zeigen jeden Ein- und Ausgang wie die Toneinstellungen des Desktops, etwa „System“ und „Chat“ eines RØDECaster Pro II statt einem einzigen „USB Audio“.",
            "Das Server-Info-Fenster ist jetzt in allen 24 Sprachen übersetzt.",
            "Der Kanalpasswort-Dialog springt nicht mehr ständig auf, während jemand anderes in einem geschützten Kanal ist. Er erscheint nur noch, wenn du selbst beitreten willst.",
            "Ist „Nicht stören“ des Desktops an, steht der Hinweis im Benutzerfeld jetzt hinter einem kleinen ? statt in einer langen Extrazeile.",
            "Die Zeile mit der geschätzten Bandbreite im Sprachqualitäts-Panel läuft in langen Sprachen nicht mehr in ihren Wert.",
          ],
        },
      ],
      known: ["Der Windows-Installer ist weiterhin unsigniert."],
    },
    {
      version: "0.4.4",
      teaser: "Code kopieren und herunterladen, Bilder per Rechtsklick speichern, Cache leeren, Sprache stabiler unter Last.",
      summary: "Ein Update für den Alltag im Chat: Code-Blöcke mit Kopieren, Herunterladen und mehr Sprachen, Bilder per Rechtsklick kopieren und speichern, ein Knopf zum Cache leeren. Dazu knackt die Sprache unter Last weniger, und Kopieren und Einfügen funktionieren wieder zuverlässig.",
      groups: [
        {
          title: "Neu",
          items: [
            "Code-Blöcke haben in der Ecke Knöpfe zum Kopieren und Herunterladen. Die Sprache hinter den drei Backticks, etwa sql, rust oder php, wird genau so hervorgehoben und in der Ecke angezeigt. Neu sind unter anderem PHP, Ruby, Kotlin, Swift, Lua, PowerShell, cmd, Dockerfile, TOML, nginx und Hex-Dumps.",
            "Rechtsklick auf ein Bild im Chat: Bild kopieren, Bild speichern, Bildadresse kopieren und im Bildbetrachter öffnen. Der Bildbetrachter hat dieselben Knöpfe. Gespeichert wird das Original, ein GIF mit Animation.",
            "Einstellungen → Datenschutz zeigt, wie viel Platz die Caches belegen, und leert sie auf Knopfdruck, auch einzeln. Chatverlauf, Einstellungen, Server, Zertifikate, Freunde und Notizen bleiben unangetastet.",
          ],
        },
        {
          title: "Verbessert",
          items: [
            "Die Sprache knackt und bricht unter hoher Last seltener ab: Mumcord bittet das System für Aufnahme und Wiedergabe um Echtzeit-Priorität, und ein kurzer Aussetzer startet nicht mehr den ganzen Ton neu. Verbindungsinfo und Diagnosedatei zeigen Aussetzer, verspätete Pakete und ob Echtzeit-Audio aktiv ist.",
            "Große GIFs von GIPHY bremsen die App nicht mehr aus: Der Chat zeigt eine kleinere, passende Version.",
          ],
        },
        {
          title: "Behoben",
          items: [
            "Markierten Text im Chat kopieren geht wieder: Der Rechtsklick bietet zuerst „Kopieren“, Strg+C kopiert den reinen Text mit Zeilenumbrüchen, und die Markierung bleibt dabei sichtbar.",
            "Eingefügte Bilddaten, etwa ein Screenshot aus Spectacle oder „Bild kopieren“ im Browser, landen unter Linux wieder im Chat.",
            "Die Kopieren-Knöpfe an Code-Blöcken, im Paketinspektor und beim Teilen von Themes funktionieren jetzt auch unter Linux.",
            "Gelöschter Chatverlauf kommt über den Verlaufsabgleich nicht mehr zurück, wenn du einem Kanal wieder beitrittst.",
            "In der kompakten Ansicht überlagert der Titel der Theme-Karte nicht mehr das Vorschaubild, und Nachrichtenkarten verrutschen nicht mehr.",
          ],
        },
      ],
      known: ["Der Windows-Installer ist weiterhin unsigniert."],
    },
    {
      version: "0.4.3",
      teaser: "Nachrichtenkarten für Bots, Bilder per Strg+V, Fehlerbanner lassen sich schließen.",
      summary: "Nachrichtenkarten kommen früher als geplant: Bots und Menschen posten kompakte Karten mit Status, Bild und Link. Dazu landen Bilder aus der Zwischenablage im Chat, das Banner nach einem Verbindungsfehler bleibt nicht mehr für immer stehen, und Nachrichten kurz vor dem Trennen gehen nicht mehr verloren.",
      groups: [
        {
          title: "Neu",
          items: [
            "Nachrichtenkarten: Bots und Menschen posten eine kompakte Karte mit Titel, Statusfarbe (Info, Erfolg, Warnung, Fehler, immer auch als Text), Symbol, formatiertem Text, Bild und Link, geschrieben als einfacher [card]-Block. Offizielle Mumble-Clients sehen dieselbe Nachricht als lesbaren Text. Bilder laden nur mit eingeschalteten Link-Vorschauen und über Mumcord.",
          ],
        },
        {
          title: "Verbessert",
          items: [
            "Bilder aus der Zwischenablage einfügen: Strg+V mit einem Screenshot, „Bild kopieren“ aus dem Browser oder einer kopierten Bilddatei hängt das Bild an wie ein hineingezogenes, mit denselben Größengrenzen.",
            "Das Banner nach einem Verbindungsfehler verschwindet nach 60 Sekunden und lässt sich mit ✕ sofort schließen. Es nennt den Namen des Servers und erscheint erst beim nächsten Fehlschlag wieder. Die Serverliste zeigt den Fehler weiter an.",
            "Der Linux-Installer fragt nur noch nach gst-libav (für H.264-Videos), wenn es fehlt, und installiert es auf Wunsch gleich mit. Dazu ein neuer Look: Banner, nummerierte Schritte mit Fortschritt und eine Zusammenfassung am Ende.",
          ],
        },
        {
          title: "Behoben",
          items: [
            "Nachrichten, die du direkt vor dem Trennen oder Beenden schickst, gehen nicht mehr verloren: Mumcord schickt erst alles ab, was noch in der Warteschlange steht.",
          ],
        },
        {
          title: "Für die Fehlersuche",
          items: [
            "Ein versteckter Paketinspektor: Sieben Klicks auf die Version unter Einstellungen → Über schalten ihn frei. Er zeigt in einem eigenen Fenster die Mumcord-Daten, die gesendet und empfangen werden, mit Filtern, Zählern und Export als JSON oder Markdown. Nur lokal, nichts wird verschickt.",
          ],
        },
        {
          title: "Für Entwickler",
          items: [
            "Die Bibliotheken für das Mumble-Protokoll, Sprache, Speicher und direkte Verbindungen erscheinen mit jedem Release auf crates.io: mumcord-protocol, mumcord-codec, mumcord-audio, mumcord-store und mumcord-p2p. Mumbot baut schon darauf auf.",
            "Jedes Release bekommt eine Stückliste (SBOM) aller Bibliotheken, und die Hinweise zu Drittanbietern unter Einstellungen → Über werden automatisch erzeugt.",
          ],
        },
      ],
      known: ["Der Windows-Installer ist weiterhin unsigniert."],
    },
    {
      version: "0.4.2",
      teaser: "YouTube im Linux-AppImage repariert, keine Schlüsselbund-Flut mehr unter macOS.",
      summary: "Ein kleines Update mit drei Fixes: YouTube spielt im Linux-AppImage wieder, keine Flut von Schlüsselbund-Abfragen mehr nach einem Update unter macOS, und wer später in einen Kanal kommt, sieht laufende Bildschirmfreigaben und Watch-Partys zuverlässiger.",
      groups: [
        {
          title: "Behoben",
          items: [
            "YouTube-Videos in Watch-Partys spielen im Linux-AppImage wieder, statt „Dieses Video kann in deinem Browser nicht abgespielt werden“ zu zeigen: Das AppImage bringt jetzt den Opus-Audio-Parser mit, den YouTube braucht.",
            "Keine Flut von Schlüsselbund-Abfragen mehr nach einem Update unter macOS: Ein abgelehnter oder fehlgeschlagener Zugriff wird nicht mehr bei jeder Aktualisierung der Serverliste, jeder Benachrichtigung und jedem Neuverbinden wiederholt, und die Identität wird nur einmal pro Sitzung gelesen.",
            "Wer einem Sprachkanal beitritt, während jemand seinen Bildschirm teilt oder eine Watch-Party läuft, sieht das jetzt zuverlässiger: Die Ankündigung wird ein zweites Mal geschickt, falls der Server die erste verschluckt hat.",
          ],
        },
      ],
      known: ["Der Windows-Installer ist weiterhin unsigniert."],
    },
    {
      version: "0.4.1",
      teaser: "Für macOS signiert und notarisiert, Verbindungen repariert.",
      summary: "Ein kleines Update, vor allem für macOS: Die Builds sind jetzt signiert und von Apple notarisiert, Verbindungen zu Servern im Heimnetz klappen wieder, und Mumcord fragt viel seltener nach dem Schlüsselbund.",
      groups: [
        {
          title: "macOS",
          items: [
            "Verbindungen klappen wieder: Mumcord fragt jetzt nach der Erlaubnis für das lokale Netzwerk. Ohne sie hat macOS 15 und neuer Verbindungen zu Servern im Heimnetz blockiert.",
            "Klare Gründe, wenn eine Verbindung scheitert, in der App und im Log, etwa „Keine Route zum Host“ mit dem Hinweis auf Systemeinstellungen → Datenschutz & Sicherheit → Lokales Netzwerk.",
            "Weit weniger Schlüsselbund-Abfragen: Jedes gespeicherte Geheimnis wird nur einmal pro Sitzung gelesen, und Mumcord braucht weniger Einträge. Einträge älterer Versionen werden beim ersten Mal zusammengeführt.",
            "Die Frage nach dem Mikrofon kommt nur noch einmal, wenn es zum ersten Mal gebraucht wird, nicht schon beim Auflisten der Geräte im Einrichtungsassistenten oder in den Einstellungen.",
            "Die Diagnose-Seite zeigt die Audiogeräte wieder an, auch wenn gerade kein Ton läuft.",
            "Signiert und von Apple notarisiert: Mumcord öffnet sich ohne Gatekeeper-Warnung, und Fragen nach Mikrofon und Schlüsselbund bleiben über Updates hinweg beantwortet.",
          ],
        },
        {
          title: "Behoben",
          items: ["Scheitern zwei Server gleichzeitig, kommen sich ihre Fragen nach Passwort und Zertifikat nicht mehr in die Quere."],
        },
      ],
      known: ["Der Windows-Installer ist weiterhin unsigniert."],
    },
    {
      version: "0.4.0",
      teaser: "Mehrere Server gleichzeitig, eigene Themes, Overlay unter Windows und Zusammen schauen.",
      summary:
        "Der Abschluss von Epic 2: mehrere Server gleichzeitig, eigene Themes in Hell und Dunkel, das Overlay im Spiel jetzt auch unter Windows, Antworten im Chat und die ersten direkten Verbindungen zwischen Mumcord-Nutzern, mit Watch-Party und Bildschirm teilen.",
      groups: [
        {
          title: "Mehrere Server gleichzeitig",
          items: [
            "Bis zu 5 Server gleichzeitig verbunden, einstellbar von 1 bis 15. Sprechen auf einem, mitlesen, schreiben und benachrichtigt werden auf allen.",
            "Server mit „Beim Start immer verbinden“ und die zuletzt offenen verbinden sich von selbst; jeder Server verbindet sich nach einem Abbruch für sich neu.",
            "Benachrichtigungen und private Nachrichten mit Servernamen, Benachrichtigungen pro Server stummschaltbar.",
            "„Kanal beitreten“ auch bei Freunden auf einem anderen Server; Links mit mumble:// zu einem verbundenen Server springen direkt hin.",
          ],
        },
        {
          title: "Themes und Look",
          items: [
            "Eigene Themes aus wenigen Grundfarben, mit Vorlagen und Live-Vorschau, jedes in einer dunklen und einer hellen Version; die zweite erzeugt Mumcord selbst und sorgt für gut lesbaren Kontrast.",
            "Themes als Farbkreise auswählen; eigene Themes speichern, umbenennen und löschen, die helle und die dunkle Version nebeneinander bearbeiten.",
            "Themes als Text teilen: Im Chat erscheint eine Vorschaukarte, ein Klick übernimmt das Theme für die App oder für einen Server.",
            "Auf Wunsch ein eigenes Theme pro Server.",
            "Der Look dieser Website in der App: leuchtende Knöpfe, Farbverläufe, Glas-Effekte und leichtes Filmkorn, abschaltbar.",
          ],
        },
        {
          title: "Feinschliff und große Server",
          items: [
            "Eigene Auswahllisten statt der Browser-Optik, alle Eingabefelder in den Einstellungen sauber ausgerichtet.",
            "Ein schmaler Fortschrittsbalken unter Bildern im Chat, während die volle Größe lädt.",
            "Große Server frieren beim ersten Anzeigen nicht mehr ein, dazu die Schalter „Leere Kanäle ausblenden“ und „Sprechende zuerst“.",
            "Gesendete Nachrichten erscheinen sofort, leicht grau, bis der Server sie bestätigt; klappt das nicht, lassen sie sich erneut senden oder löschen.",
            "Profilkommentar mit Fett, Kursiv, Links und Listen.",
            "Ein eigener Regler für die Bitrate, bis zum höchsten Wert, den Server und Mumble zulassen.",
            "Falsches Passwort? Ein Fenster fragt gleich nach dem richtigen und speichert es auf Wunsch.",
            "Wer einem Kanal nur zuhört, steht mit einem Ohr-Symbol in der normalen Liste statt in einer eigenen Gruppe.",
            "Die Einstellungen für eine Person, etwa Lautstärke und Stummschalten, stehen eingeklappt im Profil, mit kurzem Hinweis, wenn etwas verstellt ist.",
            "Kanäle mit Passwort: Mumcord fragt danach und merkt es sich pro Server, gesperrte Kanäle zeigen ein Schloss.",
            "Tooltips im Look des Themes statt der grauen System-Tooltips.",
          ],
        },
        {
          title: "Chat",
          items: [
            "Auf Nachrichten antworten, im Kanal und privat: mit einem kurzen Zitat, das auch im offiziellen Mumble-Client lesbar ist; ein Klick darauf springt zum Original.",
            "Bei langen Nachrichten steht das Profilbild oben beim Namen, und beim Scrollen bleiben Bild und Name sichtbar.",
            "Antwortet jemand auf deine Nachricht, zählt das wie eine @Erwähnung.",
            "„> Text“ wird zum Zitat, auch per Knopf; „>_>“ und ähnliche Smileys bleiben, wie sie sind.",
            "Willkommensnachricht des Servers und Kanalbeschreibung lassen sich wegklicken und tauchen wieder auf, wenn sie sich ändern.",
            "Rechtsklick auf einen Link im Chat: kopieren oder öffnen.",
            "Behoben: YouTube- und Twitch-Videos spielen auch in den fertigen Versionen unter Linux und macOS direkt im Chat.",
          ],
        },
        {
          title: "Verbindungsqualität",
          items: [
            "Die Verbindung im Profil auf einen Blick (gut, mittel, schwach), aufgeklappt mit Ping, Paketverlust, Bandbreite und UDP oder TCP, auch für dich selbst; im Menü einer Person kurz Ping und Verbindungsart. Admins sehen zusätzlich Client und Betriebssystem.",
            "Ein kleines Signal-Symbol bei Leuten mit schwacher Verbindung, abschaltbar.",
          ],
        },
        {
          title: "Overlay",
          items: [
            "Overlay im Spiel jetzt auch unter Windows, als eigenes, durchklickbares Fenster über dem Spiel. Es lädt nichts ins Spiel und geht deshalb auch in Spielen mit Anti-Cheat; nur im exklusiven Vollbild bleibt es unsichtbar.",
            "Richtige Farben in HDR-Spielen, Spiele aus Flatpak-Steam, randlose Vollbildspiele unter KDE und GNOME geprüft.",
            "Behoben: Schließt oder aktualisierst du Mumcord, stürzt ein laufendes Spiel nicht mehr ab.",
            "Overlay im Spiel auch in nativen Linux-Spielen mit OpenGL, zum Beispiel Project Hospital, Euro Truck Simulator 2 und Hearts of Iron IV: Mumcord zeigt die passende Steam-Startoption zum Kopieren, die auch nach Updates gilt.",
            "Das Overlay-Fenster fällt weg; wer es genutzt hat, bekommt einmal einen Hinweis und landet in den Einstellungen für das Overlay im Spiel.",
            "„Spiel beitreten“ auch für Spiele, die ihre Serveradresse über Mumble Link mitteilen.",
          ],
        },
        {
          title: "Direkt von Mumcord zu Mumcord",
          items: [
            "Direkte, verschlüsselte Verbindungen zwischen Mumcord-Nutzern über IPv6, die Portfreigabe des Routers oder das eigene Netz, ohne fremden Server.",
            "Mumcord fragt vorher einmal, weil die anderen dabei deine IP-Adresse sehen; in den Einstellungen änderbar.",
            "Bilder in voller Größe kommen darüber viel schneller an; klappt keine direkte Verbindung, läuft es wie bisher.",
            "Schließt du den Bildbetrachter, lädt das Bild im Hintergrund weiter; abbrechen geht mit dem × am Fortschrittsbalken.",
          ],
        },
        {
          title: "Zusammen schauen (Beta)",
          items: [
            "YouTube-Watch-Party: Alle im Sprachkanal schauen dasselbe Video gleichzeitig, jeder kann pausieren und spulen, mit gemeinsamer Playlist, zu der alle etwas hinzufügen.",
            "Bildschirm oder Fenster teilen, für bis zu 8 Zuschauer, standardmäßig in 720p mit 30 Bildern pro Sekunde; unter Windows und macOS auf Wunsch mit dem Ton der geteilten App, unter Linux ohne Ton.",
            "Beides startest du über einen Apps-Knopf im Chat deines Sprachkanals.",
            "Watch-Party und geteilte Bildschirme laufen in schwebenden Fenstern in der App, die du verschieben, größer ziehen und einklappen kannst; ein Hinweis oben im Chat zeigt, was im Kanal gerade läuft.",
            "Teilst du deinen Bildschirm, zeigt ein roter Balken mit „Beenden“ das deutlich an, und bei den anderen hat dein Bild einen roten Ring mit „LIVE“.",
            "Wer später in den Kanal kommt, sieht laufende Watch-Partys und geteilte Bildschirme sofort; eine neue Watch-Party wartet pausiert, bis jemand auf Play drückt.",
            "Der Ton von Video und geteiltem Bildschirm wird leiser, solange jemand spricht, einstellbar.",
            "Kurze Töne, wenn jemand eine Watch-Party startet, beitritt oder verlässt und wenn jemand seinen Bildschirm teilt; jeder Ton einzeln abschaltbar.",
          ],
        },
        {
          title: "Installation unter Linux und Updates",
          items: [
            "Pakete für Debian und Ubuntu (.deb), Fedora und openSUSE (.rpm), Arch (AUR: mumcord-bin) und das AppImage, jeweils für x86_64 und ARM64.",
            "Installation mit einer Zeile im Terminal, mit Menüeintrag und Unterstützung für Links mit mumble://",
            "„Mumcord beim Anmelden starten“ auf allen Systemen.",
            "Auf Wunsch ein Hinweis, wenn eine neue Version da ist; Mumcord fragt dafür höchstens einmal am Tag bei GitHub nach.",
          ],
        },
      ],
      known: [
        "Positional Audio, die Spiel-Plugins, Bilder in voller Größe, Zusammen schauen und Bildschirm teilen sind Beta.",
        "Unter Windows bleibt das Overlay im exklusiven Vollbild unsichtbar. Stell das Spiel auf randloses Vollbild oder Fenstermodus.",
        "Bildschirm teilen braucht eine direkte Verbindung. Klappt keine, etwa hinter CGNAT, geht es nicht; einen Relay-Server gibt es bewusst nicht. Unter Linux wird kein Ton mitgeteilt, unter X11 nur der ganze Bildschirm.",
      ],
    },
    {
      version: "0.3.1",
      teaser: "Musikqualität und Links im Chat repariert.",
      summary: "Ein kleines Update mit zwei Fixes aus den ersten Stunden mit 0.3.0.",
      groups: [
        {
          title: "Behoben",
          items: [
            "Mit Musikqualität hören dich andere wieder: Auf Servern mit hohem Bandbreiten-Limit wurden deine Sprachpakete zu groß und gingen verloren. Andere sahen dich nur kurz aufblinken. Jetzt bleibt jedes Paket innerhalb von Mumbles Größengrenze.",
            "Links im Chat öffnen sich wieder im Browser, auch aus dem Linux-AppImage.",
          ],
        },
      ],
      known: [
        "Schließt du Mumcord, während ein Spiel mit Overlay läuft, kann das Spiel abstürzen. Schließ zuerst das Spiel oder schalte das Overlay im Spiel aus; behoben wird das mit 0.4.0.",
        "Die Installer sind weiterhin unsigniert.",
      ],
    },
    {
      version: "0.3.0",
      teaser: "Overlay im Spiel, Positional Audio, Freunde, geteilter Verlauf und 24 Sprachen.",
      summary:
        "Der Abschluss von Epic 1: Mumcord im Spiel mit Positional Audio und Overlay, und alles, was zwischen Mumcord-Nutzern möglich wird, vom geteilten Chatverlauf bis zu Freunden. Dazu alle 24 Amtssprachen der EU.",
      groups: [
        {
          title: "Im Spiel",
          items: [
            "Positional Audio (Beta): Stimmen von Leuten im selben Spiel kommen aus ihrer Richtung und werden mit der Entfernung leiser. Positionen kommen über Mumble Link oder die offiziellen Spiel-Plugins von Mumble, die einzeln schaltbar sind. Die Einstellungen zeigen, woher die Positionen gerade kommen.",
            "Ein „3D“-Symbol zeigt, wer gerade Positionsdaten sendet, auch bei offiziellen Mumble-Clients und bei dir selbst. Positional Audio lässt sich auch in den Schnelleinstellungen schalten.",
            "Overlay im Spiel unter Linux: als Vulkan-Layer mit OpenGL als Ausweichweg, auch in Steam- und Proton-Spielen, getestet unter anderem mit Tyr und Supermarket Simulator. Pro Spiel schaltbar, global „An“ oder „Aus“, im Wizard wählbar und standardmäßig aus. Vor dem Einschalten gibt es einen Hinweis zu Anti-Cheat.",
            "Standardmäßig ohne Overlay im Spiel, weil ihr Anti-Cheat Overlays sperrt oder meldet: VALORANT und League of Legends (Riot Vanguard), Call of Duty mit Modern Warfare II/III, Warzone und Black Ops 6 (Ricochet), Counter-Strike 2 in FACEIT-Matches (FACEIT Anti-Cheat), PUBG: BATTLEGROUNDS (BattlEye) und Apex Legends (Easy Anti-Cheat). Mumcord zeigt den Grund an; einschalten geht nur mit ausdrücklicher Bestätigung.",
            "Overlay-Fenster unter Linux und Windows: durchsichtig, durchklickbar und immer im Vordergrund, mit Ecke, Größe und Deckkraft, schaltbar im Tray. Es zeigt nur Leute aus deinem Kanal. Unter KDE Wayland legt Mumcord die passende Fensterregel mit einem Klick an.",
            "„Spielt gerade“, auf Wunsch: Andere sehen, was du spielst, mit Steam-Bild und Spielzeit. „Spiel beitreten“ für Steam-Spiele, die das unterstützen.",
          ],
        },
        {
          title: "Mumcord unter sich",
          items: [
            "Geteilter Chatverlauf: Mumcord-Clients reichen bis zu 7 Tage Kanalverlauf weiter, damit du nachlesen kannst, was vor deinem Beitreten geschrieben wurde. Nie private Nachrichten, als „aus dem Verlauf von …“ markiert, ohne doppelte Nachrichten und abschaltbar.",
            "Knopf „Zu den neuesten“ mit Zähler, wenn du weiter oben liest.",
            "Ein Mumcord-Abzeichen zeigt, wer Mumcord nutzt, auch bei dir selbst.",
            "Bilder in voller Größe (Beta): Offizielle Clients bekommen eine Vorschau im Rahmen des Server-Limits, Mumcord-Nutzer laden das ganze Bild im Bildbetrachter direkt vom Absender. Anbieten und Laden lassen sich einzeln abschalten.",
            "Freunde: wiedererkannt am Zertifikat, auch über Server und Umbenennungen hinweg. Die Freunde-Liste in der rechten Spalte zeigt, wer online ist und in welchem Kanal. Der private Verlauf mit Freunden bleibt erhalten.",
          ],
        },
        {
          title: "Leute",
          items: [
            "Doppelklick auf eine Person öffnet den privaten Chat. Ein Klick heftet ihre Karte an, mit Knöpfen für private Nachricht und Profil.",
            "Neues Profil mit Banner, Abzeichen, Musik oder Spiel und allen Einstellungen für die Person. Änderungen gelten sofort, mit kurzem „Gespeichert“.",
            "Das Menü per Rechtsklick auf Leute hat Symbole und Schalter statt Beschriftungen wie „Stummschalten“ und „Lautschalten“.",
            "@Erwähnungen sind anklickbar: Vorschau beim Drüberfahren, Profil per Klick, Menü per Rechtsklick.",
            "„‹Kanal› beitreten“ im Menü einer Person oder eines Freundes bringt dich in ihren Kanal. Erlaubt der Server das nicht, steht der Grund daneben.",
            "Die rechte Spalte hat einklappbare Bereiche: „In ‹Kanal›“, „In anderen Kanälen“ mit allen anderen auf dem Server und „Freunde“. Mumcord merkt sich, was offen ist. Links steht „Serverübersicht“ über dem Kanalbaum.",
          ],
        },
        {
          title: "Einstellungen und Komfort",
          items: [
            "Alle 24 Amtssprachen der EU, auch im Tray-Menü. In der Auswahl steht jede Sprache in ihrem eigenen Namen und lässt sich unter jedem Namen finden. Übersetzt hat das Team ohne Prüfung durch Muttersprachler: Fehler gern als Issue melden.",
            "Ein neuer Schritt im Wizard zeigt vor der Wahl der Link-Vorschauen, womit sich Mumcord verbindet und wann, mit Link zur vollständigen Datenschutzerklärung.",
            "Ein Klick aufs Zahnrad öffnet die Schnelleinstellungen: Vorschauen, Design, Overlay, Musik und Spiel teilen, Profil bearbeiten und auf dem Server registrieren. Positional Audio und die anderen Beta-Funktionen stehen in einer eigenen, einklappbaren Gruppe.",
            "Einstellungen mit Suche, die zur Einstellung springt und sie hervorhebt. Die Seitenleiste bleibt beim Scrollen stehen.",
            "Neuer Bereich Barrierefreiheit: sichtbare Tastaturhinweise, Ansagen für Screenreader und Sprunglinks, einzeln schaltbar.",
            "Unter „Über“ gibt es Links zum Changelog und zum Melden von Fehlern und Wünschen.",
            "Kompatibilitätsmodus unter KDE: Ein Knopf richtet die „Unterstützung für ältere X11-Anwendungen“ ein, damit Push-to-Talk mit Maustasten auch im Hintergrund geht.",
          ],
        },
        {
          title: "Behoben",
          items: [
            "Bilder reinziehen und einfügen klappt zuverlässig: Vorschau vor dem Senden, mehrere Bilder auf einmal, keine file://-Links mehr im Eingabefeld.",
            "Gesendete Bilder sind scharf: bis 1920 px, PNG oder JPEG je nach Bild, das Server-Limit wird voll genutzt.",
            "Ein GIF zu den Favoriten zu ziehen ruckelt nicht mehr, und die Favoritenauswahl bleibt auch mit vielen GIFs flüssig.",
          ],
        },
      ],
      known: [
        "Positional Audio, die Spiel-Plugins und Bilder in voller Größe sind Beta: Wie gut es klappt, hängt vom Spiel ab.",
        "Das Overlay im Spiel unter Windows folgt später; bis dahin gibt es dort das Overlay-Fenster. Unter macOS gibt es kein Overlay.",
        "„Kanal beitreten“ für Freunde auf einem anderen Server kommt mit Epic 2, wenn Mumcord mehrere Server gleichzeitig kann.",
        "Die Installer sind weiterhin unsigniert. Die Signierung für Windows und macOS ist vorbereitet und startet, sobald die Zertifikate eingerichtet sind.",
      ],
    },
    {
      version: "0.2.0",
      summary:
        "Der Chat kann jetzt deutlich mehr. Links, Videos, Bilder und GIFs erscheinen direkt im Chat, dazu @Erwähnungen, Code-Hervorhebung und eine Formatierungsleiste. Ab dieser Version steht Mumcord unter der GNU AGPL v3.",
      groups: [
        {
          title: "Chat",
          items: [
            "Link-Vorschauen mit Titel, Beschreibung und Bild. An standardmäßig, abschaltbar im Wizard und in den Einstellungen; Vorschauen lassen sich pro Nachricht wegklicken.",
            "Karten für YouTube, Twitch und Spotify. Der Player lädt erst, wenn du draufklickst.",
            "Externe Bilder und Bildlinks direkt im Chat. Ein Klick öffnet den Bildbetrachter mit Zoom, Verschieben, Pfeiltasten durch alle Bilder des Chats und „Bild speichern“.",
            "GIFs: Links zu Giphy und Tenor spielen direkt ab, mit Hinweis auf die Quelle. Per Rechtsklick als Favorit speichern und über den GIF-Knopf wieder senden. Eine GIF-Suche gibt es bewusst nicht, dafür müsste ein API-Schlüssel in die App.",
            "@Erwähnungen mit Autovervollständigung. Erwähnungen werden hervorgehoben, benachrichtigen auch in stillen Kanälen und haben einen eigenen Ton; Ton und Benachrichtigung sind getrennt schaltbar.",
            "Code-Blöcke und Inline-Code mit Syntax-Hervorhebung.",
            "Formatierungsleiste und Kürzel: Strg+B fett, Strg+I kursiv, Strg+Shift+X durchgestrichen, Strg+E Code, Strg+K Link.",
            "Aufräumen: Vorschauen und Bilder werden nach einstellbaren Tagen gelöscht (Standard 7), auf Wunsch auch alte Chatverläufe.",
          ],
        },
        {
          title: "Sprache und Audio",
          items: [
            "Sprachaktivierung mit manueller Schwelle: ein Regler über der Live-Pegelanzeige, mit kurzer Haltezeit, damit Wortenden nicht abgeschnitten werden.",
            "„Läuft gerade“, standardmäßig aus: Andere Mumcord-Nutzer sehen Titel, Cover und Fortschritt der Musik, die du hörst. Offizielle Clients sehen eine Zeile im Kommentar. Unter Linux und Windows; macOS noch nicht.",
            "Ist das gewählte Audiogerät weg, startet Mumcord die Streams nicht mehr ständig neu, sondern versucht es im Hintergrund weiter.",
          ],
        },
        {
          title: "Kleinigkeiten",
          items: [
            "Der Einstellungen-Knopf ist jetzt ein Zahnrad.",
            "Bei Push-to-Talk zeigt das Mikrofon unten links durchgestrichen an, solange die Taste nicht gedrückt ist.",
            "Der Chat, den du gerade offen hast, zeigt keinen kurz aufblitzenden Ungelesen-Zähler mehr.",
          ],
        },
        {
          title: "Lizenz",
          items: [
            "Ab 0.2.0 steht Mumcord unter der GNU AGPL v3. Versionen bis 0.1.1 bleiben MIT.",
          ],
        },
      ],
      known: [
        "Die Installer sind weiterhin unsigniert.",
        "„Läuft gerade“ funktioniert unter macOS noch nicht.",
        "Positional Audio, Overlay, „Spielt gerade“, geteilter Chatverlauf und Freunde folgen mit 0.3.0.",
      ],
    },
    {
      version: "0.1.1",
      summary:
        "Ein kleines Update für alle, die über Mumble Musik hören oder machen: ein Schalter für Musikqualität.",
      groups: [
        {
          title: "Sprache und Audio",
          items: [
            "Neuer Schalter „Musikqualität“ unter Einstellungen → Audio, standardmäßig aus. Eingeschaltet darf die Bitrate bis zum Limit des Servers steigen, höchstens 510 kbit/s statt 96 kbit/s, und der Opus-Encoder ist auf Musik statt Sprache eingestellt.",
            "Mit Musikqualität sind Rauschunterdrückung und automatische Lautstärke aus, damit Musik nicht verfälscht wird. Am besten zusammen mit Push-to-Talk nutzen.",
            "Die Bitrate passt sich weiterhin an Paketverlust an und sinkt bei schlechter Verbindung.",
          ],
        },
      ],
    },
    {
      version: "0.1.0",
      summary:
        "Die erste öffentliche Alpha: der Alltags-Client aus Epic 1. Läuft mit jedem normalen Mumble-Server, ohne dass dort etwas installiert wird.",
      groups: [
        {
          title: "Verbinden",
          items: [
            "Server-Leiste mit gespeicherten Servern; hinzufügen per Adresse oder mumble://-Link, bearbeiten, sortieren, entfernen.",
            "mumble://-Links aus dem Browser öffnen Mumcord und springen direkt in den Kanal.",
            "Zertifikatsprüfung beim ersten Kontakt mit Fingerabdruck, klare Warnung bei Änderungen.",
            "Automatisches Wiederverbinden mit Kanal, Stumm/Taub-Status und gefolgten Kanälen. Nach einem Neustart Angebot, dem letzten Sprachkanal wieder beizutreten.",
            "Verbinden ist zuerst nur lesend (stumm und taub), bis du einem Kanal beitrittst. Abschaltbar in den Einstellungen.",
          ],
        },
        {
          title: "Kanäle und Chat",
          items: [
            "Kanälen per Auge folgen oder über das Server-Menü allen folgen; Ungelesenes als Zähler, auch für den eigenen Kanal.",
            "Chat mit Avataren und gruppierten Nachrichten, wahlweise kompakt. Markdown, Bilder einfügen oder reinziehen.",
            "Kanalbeschreibung und Willkommensnachricht oben im Chat angeheftet.",
            "Avatar-Stapel für eingeklappte und volle Kanäle, Profilvorschau beim Drüberfahren.",
            "Rechtsklick auf Personen: Profil, für mich stummschalten, Lautstärke 0–200 %, private Nachricht.",
            "Status-Icons mit Tooltip für Gast, registriert, stumm, taub, vom Server stummgeschaltet und unterdrückt.",
            "Große Server: Suche mit Strg+K, „Zu meinem Kanal springen“, eingeklappter Start ab etwa 50 Kanälen. Getestet mit 1000 Personen in 305 Kanälen.",
            "Kanal- und Mitgliederliste in der Breite ziehbar.",
          ],
        },
        {
          title: "Sprache und Audio",
          items: [
            "Sprachaktivierung oder Push-to-Talk mit Tasten und Maustasten, auch im Hintergrund. Unter Wayland über das Shortcut-Portal oder im Kompatibilitätsmodus.",
            "KI-Rauschunterdrückung, Echounterdrückung und automatische Verstärkung.",
            "Bitrate passt sich dem Netz an; verschlüsselte Sprache über UDP mit TCP-Fallback.",
            "Geräte wechseln ohne neu zu verbinden, Mikrofontest mit Wiedergabe der eigenen Stimme.",
          ],
        },
        {
          title: "Komfort",
          items: [
            "Einrichtung in etwa einer Minute: Identität, Mikrofon, Sprechmodus.",
            "Benachrichtigungen für neue Nachrichten als Pop-up in der App, als Systembenachrichtigung, beides oder aus.",
            "Kurze Töne pro Ereignis, auch beim Beitreten und Auflegen.",
            "Tray-Symbol, Start beim Anmelden, optional minimiert.",
            "Helles und dunkles Design; Deutsch, Englisch und Spanisch.",
            "Identität im sicheren Speicher des Systems, Import und Export als PKCS#12.",
            "Diagnosedatei ohne Chatinhalte oder persönliche Daten. Keine Telemetrie.",
          ],
        },
      ],
      known: [
        "Die Installer sind unsigniert: Windows SmartScreen und macOS Gatekeeper warnen beim ersten Start.",
        "Eine Serververbindung gleichzeitig. Mehrere Server kommen mit Epic 2.",
        "Chat-Extras wie Link-Vorschauen und @Erwähnungen folgen mit 0.2.0, Positional Audio, Overlay, geteilter Chatverlauf und Freunde mit 0.3.0.",
      ],
    },
  ],
  en: [
    {
      version: "0.7.1",
      teaser: "Crash reports you check yourself and upload only on request, and camera fixes for cameras that showed no picture before.",
      summary: "A small update: when Mumcord closes unexpectedly, a report stays on your computer and is sent only if you want it. More cameras start too, also through the camera portal, and the background pictures in the preview show right away.",
      groups: [
        {
          title: "New",
          items: [
            "Crash reports: when Mumcord closes unexpectedly it saves a short report on your computer and tells you at the next start. It holds what went wrong, which features were in use, the system details and the last log lines.",
            "In Settings → Advanced & Developer → Crash reports you see the last 10 and can copy, view, export or delete them.",
            "You can send a single report to the Mumcord team. The confirmation shows exactly what is sent and takes a comment. Nothing leaves your computer without “Send”.",
            "Under Diagnostics you copy the last 200 log lines or the whole log and open the log folder.",
            "The log names more causes: which camera modes were tried, whether the AppImage can play H.264 (Twitch), and when background effects find nobody in the picture.",
          ],
        },
        {
          title: "Fixed",
          items: [
            "Cameras that list a mode they never send pictures in (for example a Logitech StreamCam at 720p and 30 fps) now start: Mumcord tries a lower frame rate or a smaller picture instead of giving up with “the camera sends no pictures”.",
            "Cameras through the desktop camera portal no longer stop with “the camera sends unreadable pictures”.",
            "Camera preview: the built-in background images show right away when you choose Image, instead of leaving the tiles empty for a moment every time the preview opens.",
          ],
        },
      ],
    },
    {
      version: "0.7.0",
      teaser: "File sharing, your camera, screen sharing with sound and AV1 for up to 25 viewers, plugins in the media area, kick, ban and the ban list.",
      summary: "A big update: you share files up to 2 GB in the channel, always through the relay, show your camera with a blurred background, your screen share gets sound, AV1 and up to 25 viewers, you split picture and chat with one handle, plugins get the media area and clear safety rules, and admins can kick, ban and keep the ban list in order.",
      groups: [
        {
          title: "File sharing",
          items: [
            "Drag files and folders into the chat or attach them with the paperclip, up to 2 GB. If there is no relay or it doesn’t allow files, the paperclip says why.",
            "Files always go through the server’s relay: nobody sees your IP address, and the file never touches the Mumble server.",
            "Every download asks first and shows the folder it saves to. Afterwards Mumcord checks that the file arrived unchanged.",
            "Programs and scripts get an extra warning before download and before opening.",
            "Your shared files show who downloaded them and have a “Stop sharing” button.",
            "Images you drop into a channel can be sent as images or shared as files. All other files are shared at once.",
            "New in Settings → Privacy & Connections: receiving files on or off, the maximum size from 100 MB to 2 GB and the folder for received files.",
          ],
        },
        {
          title: "Screen sharing",
          items: [
            "Sound while sharing: a whole screen shares all sound except Mumcord’s, a window shares only that app’s sound. Works on Windows 10 (2004 or newer), macOS 13 and Linux with PipeWire.",
            "Before you start, pick resolution, frame rate, sharp text or smooth motion, codec and upload limit. The Quality menu changes them during the share without restarting it.",
            "Mumcord picks the encoder itself: AV1 on the graphics card, AV1 on the processor or VP9. The bar of your share shows quality, encoder and whether it goes through the relay.",
            "When you share a window, “Which app’s sound?” asks whose sound goes along. You can also pick “No sound”.",
            "Through the relay you upload once and up to 25 people watch, end-to-end encrypted.",
            "AV1 on the graphics card or the processor for sharp text with less bandwidth. VP9 stays as the fallback, also for viewers on an older Mumcord.",
            "Viewers see codec, path and quality and can lower their frame rate. The viewer list shows who gets what.",
            "New “Screen sharing” tab in Settings with your defaults and the encoder your computer uses.",
            "Split picture and chat yourself: drag the handle between a screen share or watch party and the chat. Drag it all the way up and the picture becomes a mini bar, and Mumcord remembers the height.",
          ],
        },
        {
          title: "Camera",
          items: [
            "Your camera for everyone in your voice channel, only through the relay and end-to-end encrypted.",
            "The camera room sits above the chat: up to nine tiles in a grid, or the Speaker layout with one large tile. Each shows the name, a microphone-off icon and a green frame while the person talks.",
            "The camera starts with a preview nobody else sees. You pick the camera and the background, and it only goes out once you turn it on.",
            "Backgrounds: none, blur (light or strong), one of 18 built-in images or your own. It is worked out on your computer, and you can change it while the camera is running.",
            "The ⋯ on a tile offers “Pin for me”, “Show large”, “Hide …’s video” (then it isn’t downloaded at all) and “Quality for me”. It all works with the keyboard too.",
            "Next to a screen share or watch party, the picture stays large and the cameras sit in a strip beside or above it. Or you hide them, and then they aren’t downloaded.",
            "A camera button in the user panel and “Turn on camera” in the Apps menu open the preview. While the camera is on, the button turns red and a camera icon shows in the channel tree.",
            "New “Camera” tab in Settings: preview, camera, send quality, mirrored self-view, default background and how you see other people’s cameras. Plus a hotkey to turn the camera on and off.",
            "While the camera is on, the tray icon shows a red camera badge and its menu offers “Turn off camera”. When your screen locks, the camera can turn itself off.",
            "If the camera can’t be used or stops by itself, Mumcord says why, for example when the server’s relay doesn’t allow cameras.",
          ],
        },
        {
          title: "Plugins",
          items: [
            "Plugins get the media area, a side panel next to the chat, dialogs and items in the Apps menu. When more than one runs, tabs switch between them.",
            "Game data goes end-to-end encrypted through the relay, to one person or the whole channel.",
            "A security score from 0 to 100 for unofficial plugins, with its reasons at install and on updates.",
            "Every website a plugin talks to is listed at install, and new websites need your consent.",
            "Plugin pages are locked down: no camera, no microphone, no clipboard and only the websites you allowed. A page that hangs no longer freezes Mumcord.",
            "A plugin that needs a newer Mumcord says so instead of installing, and updates wait until your Mumcord can run them.",
            "Each plugin can add up to two items to the Apps menu, under “Plugins” with its icon and name. The same items show in the command palette (Ctrl+Shift+P).",
            "Plugins can play short sounds that only you hear. They are quieter while anyone talks and silent while you are deafened.",
            "A plugin can save a file, open a picture or post an image to chat, but only right after you click and with permission. It never learns where your files are.",
            "Settings → Plugins shows how much data each plugin sends through the relay, has a “Plugin safety” switch against risky plugins and lists plugins that were refused at load.",
            "The update review shows the security score before and after and why an update waits. When there are release notes, a link opens them in your browser.",
          ],
        },
        {
          title: "Admin",
          items: [
            "Kick… and Ban… in a person’s Admin menu, with a reason. Bans last 1 hour, 1 day, 7 days, 30 days, forever or until a date.",
            "The ban list in the server menu: search, filter, edit reason and end, lift bans and ban people who are not online right now.",
          ],
        },
        {
          title: "Bots",
          items: [
            "Bots stand apart: a “Bots on this server” section under the channel list shows every bot with what it does. Bots without a voice no longer show up among people.",
            "A mumbot shows as “Mumbot <version>” in its profile and the connection details instead of “Mumcord <version>”.",
          ],
        },
        {
          title: "Improved",
          items: [
            "Chat history between people on 0.7.0 catches up faster: each picture travels once, and pictures you already have are not downloaded again.",
            "Mumcord follows what the server’s relay allows, and the server info shows what that is.",
            "Switches stay visible in high-contrast mode.",
            "The Apps menu shows icons for “Share your screen” and “Watch together”, and plugins without an icon get a coloured tile of their own.",
            "The latency card says why the time is longer than low-latency mode asks for, for example when the sound server on Linux needs larger blocks.",
          ],
        },
        {
          title: "Fixed",
          items: [
            "On older processors without AVX2, Mumcord no longer crashes at start-up. Screen sharing uses VP9 there.",
            "Chat history of locked channels only goes to people actually inside the channel, not to people who just follow or listen to it.",
            "If someone uses “Always use relay”, Mumcord no longer sends them your network address.",
            "A profile from a newer Mumcord no longer causes a crash. Mumcord explains it and offers to download the latest version.",
            "Sent messages sit in the right place in the history right away and stay there.",
            "A middle click on a link, or a click with Ctrl, Cmd or Shift held, opens it in your browser instead of inside Mumcord.",
            "If you are not registered on a server whose relay only serves registered users, Mumcord now says so instead of “relay could not be reached”.",
            "Kick and Ban respond to mouse clicks.",
            "Starting a watch party from the Apps menu no longer reloads the app.",
            "Screen sharing now speaks every language.",
            "Audio no longer stutters when another app plays sound at the same time.",
            "When a screen share you watch ends, no empty picture stays behind, and the cameras go back to the room grid.",
            "Ctrl+C on selected chat text no longer leaves the clipboard empty on Linux (X11).",
            "A plugin can no longer open its dialog on its own, only shortly after you click. Messages from a plugin page arrive in the right order.",
          ],
        },
      ],
    },
    {
      version: "0.6.2",
      teaser: "Faster windows in the Linux AppImage, “What’s new” shows the right version, and small fixes.",
      summary: "A small update: in the Linux AppImage, windows open much faster, “What’s new” shows the notes for your version and no longer gets stuck loading, and the plugin strip and the hang-up button’s menu sit right again.",
      groups: [
        {
          title: "Improved",
          items: [
            "Linux AppImage: the main window and other windows such as “What’s new” and the packet inspector open much faster.",
          ],
        },
        {
          title: "Fixed",
          items: [
            "“What’s new” opens on the notes of the version you are running, followed by the older ones. Notes of newer versions no longer show up.",
            "“What’s new” has its notes built in and no longer gets stuck loading.",
            "Plugin icons in the strip under the channel list are centred and larger.",
            "The hang-up button’s menu opens above the button instead of running off the bottom of the window, and the entry for switching voice servers has an icon.",
          ],
        },
      ],
    },
    {
      version: "0.6.1",
      teaser: "Plugins on the Mac, a volume of its own for screen shares, solid menu backgrounds and “Classic” as the default sound.",
      summary: "A small update after 0.6.0: plugins now run on the Mac too, a screen share has a volume of its own, menus and cards have a solid background, and new installs start with the “Classic” sound theme. On Windows, the app and installer are now signed.",
      groups: [
        {
          title: "Improved",
          items: [
            "New installs start with the “Classic” sound theme. If you already picked “Rich”, you keep it (#339).",
            "Right-click menus, popovers, hover cards and the profile card have a solid background instead of frosted glass, so text stays easy to read where the blur is missing, for example on Linux (#337).",
            "Windows: the app and installer are now signed with a code signing certificate (#340).",
          ],
        },
        {
          title: "Fixed",
          items: [
            "Changing the volume of a screen share no longer changes the person's voice. Each has its own slider, and Mumcord remembers both per person (#333).",
            "macOS: Mumcord no longer crashes as soon as a plugin starts, such as Echolings.",
          ],
        },
      ],
    },
    {
      version: "0.6.0",
      teaser: "Plugins: polls, dice, Echolings, Mumbot Music and EVE Fit, safe in a sandbox and with no server changes.",
      summary: "Mumcord gets plugins: small, safe extras, installed from Settings, sealed off in a sandbox and with no change to the server. To start there are polls, fair dice, Echolings, a remote for the Mumbot music bot and EVE Fit. Plus a new sound theme, a goodbye sound and a faster start with a start screen.",
      groups: [
        {
          title: "New",
          items: [
            "Plugins: small add-ons that give Mumcord new features. Settings → Plugins has the tabs Installed, Browse, Updates, Repositories and, in Developer mode, Developer. Nothing is preinstalled, plugins run even when you're not connected, and “Plugins” is in the command palette too.",
            "Before every install Mumcord shows in plain words what a plugin wants to do: each permission green, yellow or red, required ones fixed, optional ones as switches. Permissions can be changed later and apply at once. A plugin never gets your chat, files, microphone, certificates or passwords.",
            "Installing and updating show a progress bar with the size, then “Checking signature”, “Unpacking” and “Starting”; a failed download can be retried.",
            "Plugins show up where you use Mumcord: a plugins strip under the channel list, cards in the chat, slash commands such as /roll, a small badge next to names, a section in profile cards, entries in a person's right-click menu and windows of their own. Messages sent by a plugin are marked “via”.",
            "A plugin card takes the place of the chat message it belongs to, such as a pasted fit or a poll. Replaced messages show the plugin's icon and name, and “Show original text” brings them back. Older messages get their cards too, without votes being counted twice.",
            "A plugin can recognise certain chat messages, such as a pasted game fit. The install prompt says in the plugin's own words what it recognises; it then gets only matching messages in your channel, never from people you blocked, and no other chat text.",
            "Plugins exchange data with the same plugin on other people's Mumcord in your channel, for a shared poll for example. It travels over the normal voice server: standard Mumble servers need nothing, other clients ignore it, and you choose who sees it. Plugin chat features work on every server you're connected to.",
            "Plugins can send notifications. They land in the notification centre under “Plugins”, can be switched off per plugin and stay silent on Do Not Disturb.",
            "Plugin updates have their own setting: automatic (default), notify only, or off. An update that wants more permissions or comes from someone else always waits for your approval; a plugin that fails to start after an update is rolled back; and any plugin can be pinned to its version. New optional permissions stay off and are offered under Updates.",
            "Servers can suggest plugins: a server's Mumbot recommends plugins, which appear in the notification centre with Install, Details, Not now and Don't ask again for this server. Nothing is installed without your approval.",
            "Your own repositories: up to ten in Settings → Plugins → Repositories, with name and key fingerprint. Their plugins are “Unofficial” everywhere, the first install warns, and if the signing key changes the repository is paused until you confirm.",
            "Developer mode (Settings → Advanced) adds a Developer tab: load, reload and unload a plugin from a folder, with its log. For authors there's the plugin SDK, a template and the mumcord-plugin command-line tool on crates.io (cargo install mumcord-plugin).",
            "mumcord://plugins/<id> links open the details of an official plugin; they never install anything.",
            "The official plugins, each in all 24 languages: Poll (2 to 10 options, live results, one vote per person), Dice roller (/roll with d20, 2d6+3, advantage and disadvantage, rolled together and verified), Echolings (a creature with 5 species, 4 stages and 3 colours that never dies and sells nothing, with two mini-games), Mumbot Music (now playing, skip, volume, queue, add tracks; right-click the bot → “Configure bot”) and EVE Fit (ship card and fitting wheel for pasted EVE Online fits).",
            "Mumbot introduces itself to Mumcord: Mumcord knows which users are bots and what they can do, and “Configure bot” only appears on bots that offer music.",
            "Safety: plugins run in a sealed sandbox with limits on memory and time. One that keeps crashing is turned off, and your voice is never affected. “Turn off all plugins” (Settings and the command palette) stops them all at once, and mumcord --no-plugins starts without any. Official plugins are signed and checked on install and after every update; a kill switch can disable a harmful plugin and is checked daily.",
            "Privacy: checking for plugins sends no identifiers and no list of your plugins. Plugin data stays on your computer, and for 30 days after removing a plugin unless you delete it.",
            "A second sound theme: “Rich”, with new, fuller sounds for connecting, messages, mentions, muting, people coming and going, kicks and bans, is now the default. Settings → Sounds switches to “Classic”, the familiar short tones, with a preview (#325).",
            "Quitting Mumcord while you're in voice plays a short goodbye sound, so you notice you just left. It only plays on a real quit, never when minimising to the tray, and has its own switch (#325).",
            "Switching channels while in voice has its own short sound instead of the connect sound, with its own switch and in both sound themes (#325).",
          ],
        },
        {
          title: "Improved",
          items: [
            "Mumcord starts faster: the code before the first screen is about a third smaller. Settings, the setup wizard, watch together, screen sharing, the server browser and code highlighting load only when you open them (#323).",
            "Instead of an empty white window and “Loading…” there's a start screen: the logo on your theme with a slim loading bar that fades into the app; with reduced motion it switches without movement (#323).",
            "The Plugins entry in the Settings sidebar shows how many updates and new optional permissions are waiting.",
            "Taller plugin cards no longer get a scrollbar of their own: they're cut off with a soft fade, and “Show more” expands them.",
            "Screen readers read a replaced chat line as its card (for example “Card from Poll: Lunch at noon?”) and skip hidden lines.",
          ],
        },
        {
          title: "Fixed",
          items: [
            "Pasting with Ctrl+V works again on some Linux desktops.",
            "The “Change” link in the Settings sidebar's “Active preset” card no longer sticks out of the card with long names (#321).",
            "The number field for simultaneously connected servers in Settings → Server is no longer stretched across the whole card (#320).",
            "In dialogs that change their content, focus stays in the dialog, so Escape and Tab keep working.",
            "A profile card closed with Escape right after using a button in it opens again afterwards.",
          ],
        },
      ],
    },
    {
      version: "0.5.0",
      teaser: "Notification centre, all private messages in one place, blocking, several identities and import from Mumble.",
      summary: "A big update for chat and privacy: a notification centre, all private messages in one place with your own rules for who may write to you, blocking, several identities and moving over from Mumble in a few clicks. Plus a community relay for images and screen sharing, music and audio in the chat, a browser for public servers and a low-latency mode for making music together.",
      groups: [
        {
          title: "New",
          items: [
            "A notification centre behind the bell in the chat header (Ctrl+Shift+N) gathers everything that wants your attention on all connected servers: mentions, replies, chat and message requests with Accept and Decline, invites to watch parties and screen shares, and servers that can no longer be reached. A click jumps to the message.",
            "Do Not Disturb: one switch in quick settings, the settings and the tray menu silences notification sounds and pop-ups on all servers. Voice keeps working and unread messages keep counting. If you like, Mumcord follows the system's Do Not Disturb on KDE Plasma, GNOME and Windows.",
            "The tray menu shows every connected server with its channel, plus Mute, Deafen and Do Not Disturb. From there you move voice to another server or channel and open your recent private chats. The tray icon shows when someone talks, when you're muted and when messages are unread.",
            "All private messages in one place: the Messages button at the top of the server bar lists every conversation from every connected server, with search, filters, pinning and muting. It replaces the Direct messages list under the channel tree. A person's menu now starts with Send message, Join channel and Add friend.",
            "You decide who may message you privately: everyone, friends only or nobody, per server too. People in your channel and conversations you accepted always get through. Others wait under Message requests, and Mumcord users can send you a chat request with a short note. Mumcord filters on your side, so the sender isn't told. You can take back an accepted conversation later.",
            "Block people: their private messages and requests disappear, their channel messages are collapsed and their voice is muted for you. A block follows the person's certificate, so it covers every server and a new name doesn't get around it. Neither the server nor the person is told; Settings → Privacy lists your blocks.",
            "@channel and @all reach everyone in a channel and count like a personal mention. Other Mumble clients just see the words, and you can mute them per server.",
            "Audio and music in the chat: direct links to audio files such as mp3, ogg, wav or flac get a small player. Links to Spotify, SoundCloud and YouTube Music play in the service's own player once you press Play; Apple Music, Tidal, Deezer and Bandcamp get a card with a link. Nothing plays by itself, and with link previews off nothing is loaded.",
            "mumble:// links in the chat show a card with the server, channel, ping and how many are online, with Join and Add to servers. A password in the link is never shown.",
            "Channels are easier to handle: right-click a channel for a menu with Join, Follow, Copy channel link, Channel info and more. Channels show their user limit, like Raid (1/10), and full ones are dimmed. With the right permission you drag people into another channel. Channel info shows the description, users, your permissions and linked channels.",
            "Low-latency mode for making music together (Beta): about 40 instead of 100 milliseconds from mouth to ear, plus the network. It switches without reconnecting and works with standard servers. Headphones recommended.",
            "Audio per channel: “Audio for this channel…” gives a channel its own settings, with the presets Voice, Music and Jam. They apply when you join, and your normal settings come back when you leave.",
            "Quick menus in the voice bar: right-click the microphone or headphones for devices, volume and a level meter, the connection info for voice quality and bitrate, and the hang-up button for Leave voice (stay connected and keep chatting) or Disconnect from all servers.",
            "A server browser in the server bar lists public Mumble servers, with search and filters for country and ping. Connect saves and connects in one click. The list only loads when you open the browser.",
            "The server dialog is sorted into four tabs and has Test connection, which checks ping, server version and certificate without saving anything. Server info shows the version, limits, your permissions and the TLS certificate. Saved channel passwords show which channel they belong to.",
            "Several identities: Settings → Identity manages several certificates, with import, export, renaming and a default. Each server can use its own identity. Your current one becomes “Default”, and everything connects as before.",
            "Import from Mumble: if the official Mumble client is installed, the setup wizard (or Settings → Servers) brings over your favourite servers, saved passwords, your certificate, audio devices and push-to-talk key. Nothing is overwritten, Mumble's files are only read, and the import can be undone.",
            "Community relay: full-size images and screen sharing can go through a relay that a server's community runs next to its Mumble server. It only passes on the encrypted connection and, if you like, hides your IP address from the other person. Screen sharing then works without a direct connection too. Voice never uses the relay.",
            "On Windows, Mumcord also comes as a portable zip: unpack, start, no installation. Data and settings stay in the folder next to the program.",
            "Hide the member column to give the chat the full width: with a button in the chat header or Ctrl+Shift+M. In a narrow window it slides in over the chat.",
            "Kicked or banned? Mumcord plays a sound for it: a slap for a kick, a slapstick kick for a ban. Both can be turned off.",
            "Server info shows whether the server announces a relay or a Mumbot, and warns when the relay has changed.",
            "Whisper and shout: talk to chosen people or to everyone in a channel without moving there, with a hold-to-talk key per target and a banner above the chat that shows who you are talking to.",
            "Updates in the app: Mumcord checks for new versions, shows what changed and installs them with one click. Every download is checked against its signature and checksums.",
            "Noise suppression in four levels: Light, Standard, Advanced (AI, beta, with the 2024 RNNoise model) and Off, each explained with a “?”.",
            "Global hotkeys in Settings → Hotkeys: besides push-to-talk, keys for mute, deafen, Do Not Disturb, joining and leaving voice, switching server or channel, the member column, quick settings and opening Mumcord. Nothing is set by default, and a key that is already taken can be moved with one click.",
            "Watch together opens a cinema view: the player with the channel chat below, controls on the picture and a panel that shows who is in sync, buffering or behind. Leave it and a mini player stays at the top of the chat.",
            "Screen sharing moved into the main column, with resolution, frame rate and a Stream details popover. Whoever shares gets a control bar at the top of the chat with pause, sound, change window, viewers and stop.",
            "“Revoke chat consent…” in the person menu and in the private messages overview: afterwards that person needs a new message request before their messages reach you again.",
          ],
        },
        {
          title: "Improved",
          items: [
            "The user panel under the channel list is redesigned: it keeps the same height in every state so the list above never jumps, shows one clear status line and has a small menu arrow on every voice button.",
            "Quick settings are calmer: one row per setting in clear groups, explanations behind a small ?, and the Beta group starts collapsed.",
            "With link previews off, they no longer vanish silently: a quiet line under the message says what was hidden and leads to the setting.",
            "“Run setup wizard again” in Settings → About goes through the setup once more. Your identity stays untouched, and only what you change is saved.",
            "The packet inspector follows new packets, pauses when you scroll up, and only records while it is open.",
            "The server and channel tree is a quarter wider by default, so longer channel names fit. Widths you set yourself stay.",
            "Settings and the setup wizard are redesigned: ten groups with section cards, a search that also finds descriptions and synonyms, badges for Beta, Changed and Recommended, and Reset section. The wizard offers setup styles that fill in sensible choices at once, and the language is picked from a searchable list.",
            "The channel header is tidier: an eye in front of the channel name shows and toggles whether you follow it, and the name opens a menu with Copy channel link, Channel password…, Channel info and Clear chat history….",
            "The person menu starts with Send message, Join ‹channel› and Add friend; Join says why when the channel is full or locked.",
            "A new Mumcord logo: an M formed by two people, one in a cap and one in a beanie.",
          ],
        },
        {
          title: "Fixed",
          items: [
            "Your own messages never play the mention sound, never show a notification and don't count as unread.",
            "The watch party respects “Show link previews and embeds”: with it off, nothing is loaded from YouTube or Twitch, and a hint leads to the setting.",
            "Linux with PipeWire: the device lists show every input and output the way the desktop's sound settings do, such as “System” and “Chat” on a RØDECaster Pro II instead of a single “USB Audio”.",
            "The server info window is now translated into all 24 languages.",
            "The channel password dialog no longer pops up again and again while someone else is in a protected channel. It only appears when you try to join yourself.",
            "With the desktop's Do Not Disturb on, the hint in the user panel now sits behind a small ? instead of a long extra line.",
            "The estimated bandwidth row in the voice quality panel no longer runs into its value in long languages.",
          ],
        },
      ],
      known: ["The Windows installer is still unsigned."],
    },
    {
      version: "0.4.4",
      teaser: "Copy and download code, save images with a right-click, clear the cache, steadier voice under load.",
      summary: "An update for everyday chat: code blocks with copy, download and more languages, copy and save images with a right-click, and a button to clear the cache. Plus voice crackles less under load, and copy and paste work reliably again.",
      groups: [
        {
          title: "New",
          items: [
            "Code blocks have Copy and Download buttons in their corner. The language after the three backticks, such as sql, rust or php, is highlighted as exactly that and shown in the corner. New ones include PHP, Ruby, Kotlin, Swift, Lua, PowerShell, cmd, Dockerfile, TOML, nginx and hex dumps.",
            "Right-click an image in the chat: copy image, save image, copy image address and open in the image viewer. The image viewer has the same buttons. Saving keeps the original, a GIF with its animation.",
            "Settings → Privacy shows how much space the caches take and clears them at the push of a button, one by one too. Chat history, settings, servers, certificates, friends and notes are never touched.",
          ],
        },
        {
          title: "Improved",
          items: [
            "Voice crackles and drops out less under heavy load: Mumcord asks the system for real-time priority for capture and playback, and a short hiccup no longer restarts all audio. Connection info and the diagnostic file show dropouts, late packets and whether real-time audio is on.",
            "Large GIFs from GIPHY no longer slow the app down: the chat shows a smaller version that fits.",
          ],
        },
        {
          title: "Fixed",
          items: [
            "Copying selected chat text works again: the right-click menu offers “Copy” first, Ctrl+C copies the plain text with its line breaks, and the selection stays visible.",
            "Pasted image data, such as a Spectacle screenshot or “Copy image” in a browser, lands in the chat again on Linux.",
            "The Copy buttons on code blocks, in the packet inspector and for sharing themes now work on Linux too.",
            "Deleted chat history no longer comes back through history sync when you rejoin a channel.",
            "In the compact layout the theme card's title no longer covers its thumbnail, and message cards no longer shift.",
          ],
        },
      ],
      known: ["The Windows installer is still unsigned."],
    },
    {
      version: "0.4.3",
      teaser: "Message cards for bots, paste images with Ctrl+V, error banners can be closed.",
      summary: "Message cards arrive earlier than planned: bots and people post compact cards with a status, an image and a link. Plus images from the clipboard land in the chat, the banner after a connection error no longer stays forever, and messages sent right before disconnecting are no longer lost.",
      groups: [
        {
          title: "New",
          items: [
            "Message cards: bots and people post a compact card with a title, a status colour (info, success, warning, error, always also named in text), an icon, formatted text, an image and a link, written as a simple [card] block. Official Mumble clients see the same message as readable text. Images load only with link previews on, through Mumcord.",
          ],
        },
        {
          title: "Improved",
          items: [
            "Paste images from the clipboard: Ctrl+V with a screenshot, “Copy image” from a browser or a copied image file attaches the image like a dropped one, within the same size limits.",
            "The banner after a connection error goes away after 60 seconds and can be closed at once with ✕. It names the server and only comes back on the next failure. The server list keeps showing the error.",
            "The Linux installer only asks about gst-libav (for H.264 videos) when it is missing, and installs it right away if you like. Plus a new look: a banner, numbered steps with progress and a summary at the end.",
          ],
        },
        {
          title: "Fixed",
          items: [
            "Messages you send right before disconnecting or quitting are no longer lost: Mumcord first sends everything still waiting in the queue.",
          ],
        },
        {
          title: "For debugging",
          items: [
            "A hidden packet inspector: seven clicks on the version under Settings → About unlock it. In a window of its own it shows the Mumcord data sent and received, with filters, counters and export as JSON or Markdown. Local only, nothing is sent anywhere.",
          ],
        },
        {
          title: "For developers",
          items: [
            "The libraries for the Mumble protocol, voice, storage and direct connections are published on crates.io with every release: mumcord-protocol, mumcord-codec, mumcord-audio, mumcord-store and mumcord-p2p. Mumbot already builds on them.",
            "Every release gets a bill of materials (SBOM) of all libraries, and the third-party notices under Settings → About are generated automatically.",
          ],
        },
      ],
      known: ["The Windows installer is still unsigned."],
    },
    {
      version: "0.4.2",
      teaser: "YouTube fixed in the Linux AppImage, no more keychain prompt flood on macOS.",
      summary: "A small update with three fixes: YouTube plays in the Linux AppImage again, no more flood of keychain prompts after updating on macOS, and people who join a channel later see a running screen share or watch party more reliably.",
      groups: [
        {
          title: "Fixed",
          items: [
            "YouTube videos in watch parties play in the Linux AppImage again instead of showing “This video can't be played in your browser”: the AppImage now ships the Opus audio parser YouTube needs.",
            "No more flood of keychain prompts after updating on macOS: a denied or failed keychain read is no longer repeated for every server list refresh, notification or reconnect, and the identity is read only once per session.",
            "People who join a voice channel while someone is sharing their screen or a watch party is running now see it more reliably: the announcement is sent a second time in case the server dropped the first.",
          ],
        },
      ],
      known: ["The Windows installer is still unsigned."],
    },
    {
      version: "0.4.1",
      teaser: "Signed and notarized for macOS, connections fixed.",
      summary: "A small update, mostly for macOS: the builds are now signed and notarized by Apple, connections to servers in your home network work again, and Mumcord asks for the keychain far less often.",
      groups: [
        {
          title: "macOS",
          items: [
            "Connections work again: Mumcord now asks for the Local Network permission. Without it, macOS 15 and later blocked connections to servers in your home network.",
            "Clear reasons when a connection fails, in the app and in the log, for example “No route to host” with a pointer to System Settings → Privacy & Security → Local Network.",
            "Far fewer keychain prompts: each saved secret is read only once per session, and Mumcord uses fewer keychain items. Items from older versions are merged on first use.",
            "The microphone prompt appears only once, when the microphone is first used, not when listing devices in the setup wizard or settings.",
            "The diagnostics page lists audio devices again, even when no audio is running.",
            "Signed and notarized by Apple: Mumcord opens without a Gatekeeper warning, and microphone and keychain answers are kept across updates.",
          ],
        },
        {
          title: "Fixed",
          items: ["When two servers fail at the same time, their password and certificate prompts no longer collide."],
        },
      ],
      known: ["The Windows installer is still unsigned."],
    },
    {
      version: "0.4.0",
      teaser: "Several servers at once, your own themes, the overlay on Windows and watching together.",
      summary:
        "Epic 2 complete: several servers at once, your own themes in light and dark, the in-game overlay on Windows too, replies in the chat and the first direct connections between Mumcord users, with a watch party and screen sharing.",
      groups: [
        {
          title: "Several servers at once",
          items: [
            "Up to 5 servers connected at once, adjustable from 1 to 15. Talk on one, read, write and get notified on all of them.",
            "Servers marked “Always connect at start” and the ones open last time connect by themselves; each server reconnects on its own after a drop.",
            "Notifications and private messages show the server name, notifications can be muted per server.",
            "“Join channel” also for friends on another server; mumble:// links to a connected server jump straight there.",
          ],
        },
        {
          title: "Themes and look",
          items: [
            "Your own themes from a few key colours, with presets and a live preview, each in a dark and a light version; Mumcord makes the second one itself and keeps the contrast readable.",
            "Pick themes as colour circles; save, rename and delete your own, and edit the light and dark versions side by side.",
            "Share themes as text: the chat shows a preview card, one click applies the theme to the app or to a server.",
            "A theme per server if you like.",
            "This website's look in the app: glowing buttons, gradients, glass effects and a light film grain, can be switched off.",
          ],
        },
        {
          title: "Polish and big servers",
          items: [
            "Themed dropdowns instead of the browser's, every input in the settings neatly aligned.",
            "A slim progress bar under chat images while the full size loads.",
            "Big servers no longer freeze when first shown, plus “Hide empty channels” and “Talking people first” switches.",
            "Sent messages show up at once, slightly grey until the server confirms them; if that fails, you can send them again or delete them.",
            "Profile comment with bold, italic, links and lists.",
            "A bitrate slider of its own, up to the highest value the server and Mumble allow.",
            "Wrong password? A window asks for the right one straight away and saves it if you like.",
            "People who only listen to a channel appear in the normal list with an ear icon instead of in a group of their own.",
            "Settings for a person, such as volume and mute, sit collapsed in their profile, with a short hint when something is changed.",
            "Channels with a password: Mumcord asks for it and remembers it per server, and locked channels show a lock.",
            "Tooltips in the theme's look instead of the grey system ones.",
          ],
        },
        {
          title: "Chat",
          items: [
            "Reply to messages, in channels and in private: with a short quote that also reads fine in the official Mumble client; one click on it jumps to the original.",
            "On long messages the profile picture sits at the top next to the name, and picture and name stay in view while you scroll.",
            "A reply to your message counts like an @mention.",
            "“> text” becomes a quote, also with a button; “>_>” and similar smileys stay as they are.",
            "The server's welcome message and the channel description can be closed and come back when they change.",
            "Right-click a link in the chat to copy or open it.",
            "Fixed: YouTube and Twitch videos play right in the chat in the released versions on Linux and macOS too.",
          ],
        },
        {
          title: "Connection quality",
          items: [
            "The connection in a person's profile at a glance (good, fair, weak), expanded with ping, packet loss, bandwidth and UDP or TCP, for yourself too; a person's menu shows just ping and transport. Admins also see the client and operating system.",
            "A small signal icon next to people with a weak connection, can be switched off.",
          ],
        },
        {
          title: "Overlay",
          items: [
            "The in-game overlay on Windows too, as a separate click-through window over the game. Nothing is loaded into the game, so it also works in games with anti-cheat; only exclusive fullscreen hides it.",
            "Correct colours in HDR games, games from Flatpak Steam, borderless fullscreen games checked on KDE and GNOME.",
            "Fixed: closing or updating Mumcord no longer crashes a running game.",
            "The in-game overlay in native Linux games that use OpenGL too, such as Project Hospital, Euro Truck Simulator 2 and Hearts of Iron IV: Mumcord shows the right Steam launch option to copy, and it keeps working after updates.",
            "The overlay window goes away; if you used it, a one-time notice takes you to the in-game overlay settings.",
            "“Join game” also for games that share their server address through Mumble Link.",
          ],
        },
        {
          title: "Straight from Mumcord to Mumcord",
          items: [
            "Direct, encrypted connections between Mumcord users over IPv6, your router's port mapping or your own network, without anyone else's server.",
            "Mumcord asks once first, because the others see your IP address; you can change it in the settings.",
            "Full-size images arrive much faster that way; if no direct connection works, it works as before.",
            "Closing the image viewer keeps the image loading in the background; the × on the progress bar cancels it.",
          ],
        },
        {
          title: "Watching together (beta)",
          items: [
            "YouTube watch party: everyone in the voice channel watches the same video at once, anyone can pause and seek, with a shared playlist everyone can add to.",
            "Share a screen or a window for up to 8 viewers, 720p at 30 frames per second by default; on Windows and macOS with the shared app's sound if you like, on Linux without sound.",
            "Start both from an Apps button in your voice channel's chat.",
            "The watch party and shared screens run in floating windows inside the app that you can move, resize and collapse; a hint at the top of the chat shows what is running in the channel.",
            "While you share your screen, a red bar with “End” makes it clear, and others see a red ring with “LIVE” around your picture.",
            "Anyone who joins the channel later sees running watch parties and shared screens at once; a new watch party waits, paused, until someone presses Play.",
            "The sound of the video and the shared screen gets quieter while someone talks, adjustable.",
            "Short sounds when someone starts, joins or leaves a watch party and when someone shares their screen; each sound can be switched off.",
          ],
        },
        {
          title: "Installing on Linux and updates",
          items: [
            "Packages for Debian and Ubuntu (.deb), Fedora and openSUSE (.rpm), Arch (AUR: mumcord-bin) and the AppImage, each for x86_64 and ARM64.",
            "Install with one line in the terminal, with a menu entry and support for mumble:// links.",
            "“Start Mumcord when I log in” on every system.",
            "Optionally a hint when a new version is out; Mumcord asks GitHub at most once a day.",
          ],
        },
      ],
      known: [
        "Positional audio, game plugins, full-size images, watching together and screen sharing are beta.",
        "On Windows, exclusive fullscreen hides the overlay. Set the game to borderless fullscreen or windowed mode.",
        "Screen sharing needs a direct connection. If none works, for example behind CGNAT, it isn't available; there is deliberately no relay server. On Linux no sound is shared, and on X11 only the whole screen.",
      ],
    },
    {
      version: "0.3.1",
      teaser: "Music quality and chat links fixed.",
      summary: "A small update with two fixes from the first hours with 0.3.0.",
      groups: [
        {
          title: "Fixed",
          items: [
            "With Music quality on, others hear you again: on servers with a high bandwidth limit your voice packets got too big and were lost, so others only saw you flash briefly. Every packet now stays within Mumble's size limit.",
            "Links in the chat open in the browser again, also from the Linux AppImage.",
          ],
        },
      ],
      known: [
        "If you close Mumcord while a game with the overlay is running, the game can crash. Close the game first or turn the in-game overlay off; this gets fixed in 0.4.0.",
        "Installers are still unsigned.",
      ],
    },
    {
      version: "0.3.0",
      teaser: "In-game overlay, positional audio, friends, shared history and 24 languages.",
      summary:
        "Completing Epic 1: Mumcord in game with positional audio and an overlay, and everything that becomes possible between Mumcord users, from shared chat history to friends. Plus all 24 official EU languages.",
      groups: [
        {
          title: "In game",
          items: [
            "Positional audio (beta): voices of people in the same game come from their direction and get quieter with distance. Positions come via Mumble Link or Mumble's official game plugins, which can be switched one by one. Settings show where positions are coming from.",
            "A “3D” icon shows who is sending positional data right now, for official Mumble clients and yourself too. Positional audio can also be switched in quick settings.",
            "In-game overlay on Linux: a Vulkan layer with OpenGL as a fallback, also in Steam and Proton games, tested with Tyr and Supermarket Simulator among others. Set per game, global “On” or “Off”, offered in the wizard and off by default. You get an anti-cheat note before turning it on.",
            "No in-game overlay by default, because their anti-cheat blocks or reports overlays: VALORANT and League of Legends (Riot Vanguard), Call of Duty with Modern Warfare II/III, Warzone and Black Ops 6 (Ricochet), Counter-Strike 2 in FACEIT matches (FACEIT Anti-Cheat), PUBG: BATTLEGROUNDS (BattlEye) and Apex Legends (Easy Anti-Cheat). Mumcord shows the reason; turning it on needs an explicit confirmation.",
            "Overlay window on Linux and Windows: transparent, click-through and always on top, with corner, size and opacity, switchable from the tray. It only shows people in your channel. On KDE Wayland Mumcord sets up the matching window rule in one click.",
            "Optional “Now gaming”: others see what you're playing, with the Steam picture and play time. “Join game” for Steam games that support it.",
          ],
        },
        {
          title: "Mumcord to Mumcord",
          items: [
            "Shared chat history: Mumcord clients pass on up to 7 days of channel history so you can read what was written before you joined. Never private messages, marked as “from …'s history”, without duplicates and can be switched off.",
            "A “Jump to newest” button with a count when you're reading further up.",
            "A Mumcord badge shows who uses Mumcord, yourself included.",
            "Full-size images (beta): official clients get a preview within the server limit, Mumcord users load the whole image in the image viewer straight from the sender. Offering and loading can each be switched off.",
            "Friends: recognised by certificate, also across servers and renames. The Friends list in the right column shows who is online and in which channel. Private history with friends is kept.",
          ],
        },
        {
          title: "People",
          items: [
            "Double-click a person to open the private chat. A click pins their card, with buttons for private message and profile.",
            "New profile with banner, badge, music or game and all settings for that person. Changes apply instantly with a short “Saved”.",
            "The right-click menu on people has icons and switches instead of labels like “Mute” and “Unmute”.",
            "@mentions are clickable: preview on hover, profile on click, menu on right-click.",
            "“Join ‹channel›” in the menu of a person or a friend takes you to their channel. If the server does not allow it, the reason is shown next to it.",
            "The right column has collapsible sections: “In ‹channel›”, “In other channels” with everyone else on the server, and “Friends”. Mumcord remembers what is open. On the left, “Server overview” sits above the channel tree.",
          ],
        },
        {
          title: "Settings and comfort",
          items: [
            "All 24 official EU languages, the tray menu included. The picker lists each language in its own name and finds it by any of its names. The team did the translations without review by native speakers: please report mistakes as an issue.",
            "A new wizard step before the link preview choice shows what Mumcord connects to and when, with a link to the full privacy statement.",
            "A click on the gear opens quick settings: previews, theme, overlay, sharing music and game, edit profile and register on the server. Positional audio and the other beta features sit in their own collapsible group.",
            "Settings with search that jumps to the setting and highlights it. The sidebar stays in place while you scroll.",
            "A new Accessibility section: visible keyboard hints, screen reader announcements and skip links, each with its own switch.",
            "“About” links to the changelog and to reporting bugs and requesting features.",
            "Compatibility mode on KDE: a button sets up “Legacy X11 App Support” so mouse-button push-to-talk also works in the background.",
          ],
        },
        {
          title: "Fixed",
          items: [
            "Dropping and pasting images works reliably: preview before sending, several images at once, no more file:// links in the input.",
            "Sent images are sharp: up to 1920 px, PNG or JPEG depending on the image, using the full server limit.",
            "Dragging a GIF to the favorites no longer stutters, and the favorites picker stays smooth with many GIFs.",
          ],
        },
      ],
      known: [
        "Positional audio, the game plugins and full-size images are beta: how well they work depends on the game.",
        "The in-game overlay on Windows comes later; until then Windows has the overlay window. There is no overlay on macOS.",
        "“Join channel” for friends on another server comes with Epic 2, once Mumcord can be on several servers at once.",
        "Installers are still unsigned. Signing for Windows and macOS is prepared and starts once the certificates are set up.",
      ],
    },
    {
      version: "0.2.0",
      summary:
        "The chat does a lot more now. Links, videos, images and GIFs show up right in the chat, plus @mentions, code highlighting and a formatting toolbar. From this version Mumcord is licensed under the GNU AGPL v3.",
      groups: [
        {
          title: "Chat",
          items: [
            "Link previews with title, description and image. On by default, can be switched off in the wizard and in settings; previews can be dismissed per message.",
            "Cards for YouTube, Twitch and Spotify. The player loads only when you click it.",
            "External images and image links right in the chat. A click opens the image viewer with zoom, panning, arrow keys through all images of the chat and “Save image”.",
            "GIFs: Giphy and Tenor links play inline, with a credit to the source. Save them as favorites by right-click and send them again from the GIF button. There is no GIF search on purpose, since it would need an API key inside the app.",
            "@mentions with autocomplete. Mentions are highlighted, notify you even in quiet channels and have their own sound; sound and notification have separate switches.",
            "Code blocks and inline code with syntax highlighting.",
            "Formatting toolbar and shortcuts: Ctrl+B bold, Ctrl+I italic, Ctrl+Shift+X strikethrough, Ctrl+E code, Ctrl+K link.",
            "Clean-up: previews and images are deleted after a number of days you choose (default 7), old chat history too if you want.",
          ],
        },
        {
          title: "Voice and audio",
          items: [
            "Voice activation with a manual threshold: a slider over the live level meter, with a short hold so word endings aren't cut off.",
            "“Now playing”, off by default: other Mumcord users see the title, cover and progress of the music you're listening to. Official clients see a line in your comment. On Linux and Windows; not on macOS yet.",
            "When the chosen audio device is gone, Mumcord no longer keeps restarting the streams but retries in the background.",
          ],
        },
        {
          title: "Small things",
          items: [
            "The settings button is a gear now.",
            "With push-to-talk, the microphone at the bottom left shows crossed out while the key isn't held.",
            "The chat you have open no longer flashes a brief unread count.",
          ],
        },
        {
          title: "License",
          items: [
            "From 0.2.0 Mumcord is licensed under the GNU AGPL v3. Versions up to 0.1.1 stay MIT.",
          ],
        },
      ],
      known: [
        "Installers are still unsigned.",
        "“Now playing” doesn't work on macOS yet.",
        "Positional audio, the overlay, “Now gaming”, shared chat history and friends follow in 0.3.0.",
      ],
    },
    {
      version: "0.1.1",
      summary: "A small update for everyone who listens to or plays music over Mumble: a music quality switch.",
      groups: [
        {
          title: "Voice and audio",
          items: [
            "New “Music quality” switch in Settings → Audio, off by default. When on, the bitrate may rise to the server's limit, at most 510 kbit/s instead of 96 kbit/s, and the Opus encoder is tuned for music instead of speech.",
            "With music quality on, noise suppression and automatic gain are off so music isn't distorted. Works best with push-to-talk.",
            "The bitrate still adapts to packet loss and drops on a bad connection.",
          ],
        },
      ],
    },
    {
      version: "0.1.0",
      summary:
        "The first public alpha: the everyday client from Epic 1. Works with any standard Mumble server, with nothing to install there.",
      groups: [
        {
          title: "Connecting",
          items: [
            "Server bar with saved servers; add one by address or mumble:// link, edit, reorder, remove.",
            "mumble:// links from the browser open Mumcord and jump straight into the channel.",
            "Certificate check on first contact with the fingerprint, and a clear warning if it changes.",
            "Automatic reconnect that restores your channel, mute/deafen state and followed channels. After a restart Mumcord offers to rejoin your last voice channel.",
            "Connecting is read-only at first (muted and deafened) until you join a channel. Can be switched off in settings.",
          ],
        },
        {
          title: "Channels and chat",
          items: [
            "Follow channels with the eye, or follow all from the server menu; unread counts, also for your own channel.",
            "Chat with avatars and grouped messages, or a compact layout. Markdown, paste or drop images.",
            "Channel description and welcome message pinned at the top of the chat.",
            "Avatar stacks for collapsed and crowded channels, profile preview on hover.",
            "Right-click a person: profile, mute for me, volume 0–200 %, private message.",
            "Status icons with tooltips for guest, registered, muted, deafened, server-muted and suppressed.",
            "Big servers: search with Ctrl+K, “Jump to my channel”, collapsed start from about 50 channels. Tested with 1000 people in 305 channels.",
            "Resizable channel and member lists.",
          ],
        },
        {
          title: "Voice and audio",
          items: [
            "Voice activation or push-to-talk with keys and mouse buttons, also in the background. On Wayland via the shortcuts portal or in compatibility mode.",
            "AI noise suppression, echo cancellation and automatic gain.",
            "Bitrate adapts to the network; encrypted voice over UDP with TCP fallback.",
            "Switch devices without reconnecting, microphone test that plays your own voice back.",
          ],
        },
        {
          title: "Comfort",
          items: [
            "Setup in about a minute: identity, microphone, talk mode.",
            "Notifications for new messages as an in-app pop-up, a system notification, both or off.",
            "Short sounds per event, including when you join and hang up.",
            "Tray icon, start at login, optionally minimized.",
            "Light and dark themes; English, German and Spanish.",
            "Identity in the system's secure storage, import and export as PKCS#12.",
            "Diagnostic file without chat contents or personal data. No telemetry.",
          ],
        },
      ],
      known: [
        "Installers are unsigned: Windows SmartScreen and macOS Gatekeeper warn on first start.",
        "One server connection at a time. Several servers come with Epic 2.",
        "Chat extras like link previews and @mentions follow in 0.2.0, positional audio, the overlay, shared chat history and friends in 0.3.0.",
      ],
    },
  ],
};

// Versions come from English; a version the translation lacks stays in English.
export const changelog = localized(source, (l) =>
  source.en.map((e) => bundles[l]?.changelog.find((t) => t.version === e.version) ?? e),
);
