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
