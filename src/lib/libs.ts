// The open-source Rust libraries that came out of Mumcord: hwcodec (video encoding),
// mumble-client-protocol (the Mumble protocol) and bgmatte (camera background effects). Each gets a documentation page that follows its
// README; the API reference itself stays on docs.rs. German and English only: the other languages
// link to the English pages, like the legal pages. Texts may contain `code` in backticks.
import type { PageId } from "../i18n";

export type LibId = "hwcodec" | "protocol" | "bgmatte";
export const LIB_IDS: LibId[] = ["hwcodec", "protocol", "bgmatte"];
export const LIB_PAGE: Record<LibId, PageId> = { hwcodec: "hwcodec", protocol: "protocol", bgmatte: "bgmatte" };

export interface LibMeta {
  crate: string;
  repo: string;
  license: string;
  msrv: string;
}

export const LIB_META: Record<LibId, LibMeta> = {
  hwcodec: { crate: "hwcodec", repo: "Mumcord/hwcodec", license: "MIT OR Apache-2.0", msrv: "1.90" },
  protocol: { crate: "mumble-client-protocol", repo: "Mumcord/mumble-client-protocol", license: "MIT OR Apache-2.0", msrv: "1.90" },
  bgmatte: { crate: "bgmatte", repo: "Mumcord/bgmatte", license: "MIT OR Apache-2.0", msrv: "1.92" },
};

export const libLinks = (id: LibId) => {
  const { crate, repo } = LIB_META[id];
  return {
    repo: `https://github.com/${repo}`,
    crates: `https://crates.io/crates/${crate}`,
    docs: `https://docs.rs/${crate}`,
    issues: `https://github.com/${repo}/issues`,
    changelog: `https://github.com/${repo}/blob/main/CHANGELOG.md`,
  };
};

/** Code is the same in every language. */
export const LIB_CODE = {
  hwcodecInstall: { file: "Cargo.toml", code: `[dependencies]\nhwcodec = "0.1"` },
  hwcodecSubset: {
    file: "Cargo.toml",
    code: `[dependencies]\n# Decode AV1 and VP9, encode VP9: no GPU SDKs, no SVT-AV1\nhwcodec = { version = "0.1", default-features = false, features = ["libvpx", "dav1d"] }`,
  },
  hwcodecDetect: {
    file: "examples/detect.rs",
    code: `use hwcodec::{Codec, detect_encoders};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    for report in detect_encoders(Codec::Av1) {
        println!("{}: {}", report.encoder, report.status);
    }
    Ok(())
}`,
  },
  hwcodecBest: {
    file: "src/main.rs",
    code: `use hwcodec::{Codec, EncoderConfig, open_best_encoder};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = EncoderConfig::new(1920, 1080, 60, 6000);
    // \`None\` is the default order: hardware first, software last.
    let (kind, _encoder) = open_best_encoder(Codec::Av1, &config, None)?;
    println!("using {kind:?}");
    Ok(())
}`,
  },
  hwcodecRun: { file: "Terminal", code: `cargo run --example detect\ncargo run --release --example encode_decode` },
  protocolInstall: {
    file: "Cargo.toml",
    code: `[dependencies]\nmumble-client-protocol = "0.1"\ntokio = { version = "1", features = ["full"] }`,
  },
  protocolConnect: {
    file: "src/main.rs",
    code: `use std::sync::Arc;
use std::time::Duration;

use mumble_client_protocol::{ConnectConfig, Event, connect};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut connection = connect(ConnectConfig {
        host: "localhost".into(),
        port: 64738,
        username: "bot".into(),
        password: None,
        tokens: Vec::new(),
        identity: None,
        // Local test server only: a real client pins the certificate or asks the user.
        verify_cert: Arc::new(|_cert| true),
        login_timeout: Duration::from_secs(10),
    })
    .await?;

    while let Some(event) = connection.events.recv().await {
        match event {
            Event::TextMessage(text) => println!("{}", text.message),
            Event::Disconnected(reason) => {
                println!("disconnected: {reason:?}");
                break;
            }
            _ => {}
        }
    }
    Ok(())
}`,
  },
  protocolBot: { file: "Terminal", code: `cargo run --example text_bot -- localhost 64738 text-bot` },
  protocolTests: { file: "Terminal", code: `MUMBLE_LIVE=1 cargo test --tests -- --ignored --test-threads=1` },
  bgmatteInstall: { file: "Cargo.toml", code: `[dependencies]\nbgmatte = "0.1"` },
  bgmatteBlur: {
    file: "src/main.rs",
    code: `use std::time::Duration;
use bgmatte::{Background, Config, Effects, Frame};

fn main() -> Result<(), bgmatte::Error> {
    // Optional: without this, ORT_DYLIB_PATH or the system's library search path is used.
    bgmatte::init_runtime("/opt/onnxruntime/lib/libonnxruntime.so.1.23.2")?;

    let mut effects = Effects::new(Config::new(30, Background::Blur { strength: 60 }));
    let (width, height) = (1280, 720);
    let mut rgba = vec![0u8; width * height * 4];
    // For each camera frame, in order:
    effects.process(Frame::rgba(&mut rgba, width as u32, height as u32), Duration::from_millis(33))?;
    println!("{:?}", effects.stats());
    Ok(())
}`,
  },
  bgmatteImage: {
    file: "src/background.rs",
    code: `use std::sync::Arc;
use bgmatte::{Background, BackgroundImage, Effects};

fn use_beach(effects: &mut Effects) -> Result<(), bgmatte::Error> {
    let beach = BackgroundImage::open("beach.jpg")?;
    effects.set_background(Background::Image(Arc::new(beach)));
    Ok(())
}`,
  },
  bgmatteRun: {
    file: "Terminal",
    code: `cargo run --release --example replace_background -- photo.jpg out.png blur=80\ncargo run --release --example bench`,
  },
} as const;
export type LibCodeId = keyof typeof LIB_CODE;

export type Block =
  | { p: string }
  | { code: LibCodeId; note?: string; /** Shown only until the crate has its first release. */ beforeRelease?: string }
  | { list: string[] }
  | { table: { head: string[]; rows: string[][] } }
  | { terms: [string, string][] };

export interface LibSection {
  id: string;
  title: string;
  blocks: Block[];
}

export interface LibDoc {
  title: string;
  menu: string;
  description: string;
  lead: string;
  status: string;
  highlights: { title: string; body: string }[];
  sections: LibSection[];
}

export interface LibsPage {
  label: string;
  contents: string;
  release: string;
  noRelease: string;
  license: string;
  copy: string;
  copied: string;
  source: string;
  docsRs: string;
  crates: string;
  issues: string;
  changelog: string;
  alsoTitle: string;
  pages: Record<LibId, LibDoc>;
}

const yes = "✓";
const no = "–";

export const libsPage: Record<"de" | "en", LibsPage> = {
  de: {
    label: "Bibliothek",
    contents: "Auf dieser Seite",
    release: "Aktuelle Version",
    noRelease: "Noch kein Release",
    license: "Lizenz",
    copy: "Kopieren",
    copied: "Kopiert",
    source: "Quellcode",
    docsRs: "API-Referenz auf docs.rs",
    crates: "crates.io",
    issues: "Ideen und Fehler",
    changelog: "Changelog",
    alsoTitle: "Auch aus Mumcord",
    pages: {
      hwcodec: {
        title: "hwcodec",
        menu: "AV1 und VP9 kodieren, ohne FFmpeg",
        description: "hwcodec ist eine Rust-Bibliothek für AV1- und VP9-Video in Echtzeit: NVENC, Quick Sync, AMF und VA-API in Hardware, SVT-AV1, libvpx und dav1d in Software.",
        lead: "AV1- und VP9-Video in Echtzeit für Rust, ohne FFmpeg. Hardware-Encoder (NVENC, Quick Sync, AMF, VA-API) und Software-Codecs (SVT-AV1, libvpx, dav1d) hinter einer Schnittstelle. Mumcord nutzt hwcodec für Bildschirm teilen und Kamera.",
        status: "Version 0.1, best effort: Nur ein Teil der Hardware ist von uns getestet.",
        highlights: [
          { title: "Eine Schnittstelle", body: "Ein Encoder ist ein `VideoEncoder`, egal ob er auf der Grafikkarte oder der CPU läuft. `open_best_encoder` nimmt den besten, der auf diesem Rechner wirklich funktioniert." },
          { title: "Ohne FFmpeg", body: "Die Treiber-Bibliotheken der Grafikkarte lädt hwcodec erst zur Laufzeit. Ein Programm startet also auch auf Rechnern ohne passende GPU und fällt auf Software zurück." },
          { title: "Für Live-Video gebaut", body: "Niedrige Latenz, bis 120 fps, Auflösung und Bitrate ändern sich im laufenden Betrieb. AV1 und VP9 mit drei zeitlichen Ebenen: Ein Sender kann für einzelne Zuschauer Ebenen weglassen, ohne neu zu kodieren." },
          { title: "Sagt, was geht und warum nicht", body: "`detect_encoders` prüft jeden Encoder und nennt Gerät, Treiberversion oder den Grund, warum er hier nicht läuft." },
          { title: "Nur, was du brauchst", body: "Jeder Codec ist ein Cargo-Feature. Ohne Features braucht der Build keinen C-Compiler, kein libclang und kein pkg-config." },
          { title: "Still", body: "Die Bibliothek speichert nichts und schreibt nichts auf die Konsole. Diagnosen laufen über das `log`-Crate." },
        ],
        sections: [
          {
            id: "installation",
            title: "Installation",
            blocks: [
              { code: "hwcodecInstall" },
              { p: "Standardmäßig sind alle Codecs an. Brauchst du nur einen Teil, schalte die Standard-Features ab und wähle selbst:" },
              { code: "hwcodecSubset", note: "Der erste Build dauert ein paar Minuten, weil die mitgelieferten Codec-Quellen gebaut werden." },
            ],
          },
          {
            id: "schnellstart",
            title: "Schnellstart",
            blocks: [
              { p: "Welche AV1-Encoder laufen auf diesem Rechner?" },
              { code: "hwcodecDetect" },
              { p: "Den besten Encoder öffnen, Hardware zuerst, Software als Rückfall. Eine eigene Reihenfolge gibst du mit `Some(&[EncoderKind::Software])` vor, `default_order(codec)` liefert die Standard-Reihenfolge." },
              { code: "hwcodecBest" },
              { p: "Die Beispiele im Repository laufen direkt. `encode_decode` kodiert und dekodiert in Software und braucht keine Grafikkarte:" },
              { code: "hwcodecRun" },
            ],
          },
          {
            id: "plattformen",
            title: "Encoder und Plattformen",
            blocks: [
              {
                table: {
                  head: ["Encoder", "Windows", "Linux", "macOS", "Codecs"],
                  rows: [
                    ["NVIDIA NVENC", yes, yes, no, "AV1"],
                    ["VA-API (Mesa AMD, Intel Media Driver)", no, yes, no, "AV1, VP9"],
                    ["AMD AMF", yes, no, no, "AV1"],
                    ["Intel Quick Sync (oneVPL)", yes, no, no, "AV1, VP9"],
                    ["Software (SVT-AV1, libvpx)", yes, yes, yes, "AV1, VP9"],
                  ],
                },
              },
              { p: "Dekodiert wird in 0.1 in Software: dav1d für AV1, libvpx für VP9. Auf macOS gibt es bisher nur Software, VideoToolbox ist geplant. FreeBSD ist best effort und ungetestet, Android und iOS werden nur kompiliert." },
            ],
          },
          {
            id: "features",
            title: "Cargo-Features",
            blocks: [
              {
                table: {
                  head: ["Feature", "Schaltet ein"],
                  rows: [
                    ["`nvenc`", "NVIDIA NVENC (Windows, Linux)"],
                    ["`amf`", "AMD AMF (Windows)"],
                    ["`qsv`", "Intel Quick Sync über oneVPL (Windows)"],
                    ["`vaapi`", "VA-API (Linux)"],
                    ["`svt-av1`", "AV1-Encoder in Software (SVT-AV1)"],
                    ["`libvpx`", "VP9-Encoder und -Decoder"],
                    ["`dav1d`", "AV1-Decoder"],
                  ],
                },
              },
              { p: "Hardware-Features werden auf anderen Plattformen zu nichts kompiliert. Fehlt ein Codec, gibt es seinen Typ nicht, und `open_best_encoder` oder `open_software_decoder` liefern `Error::NotBuilt`." },
            ],
          },
          {
            id: "bauen",
            title: "Bauen",
            blocks: [
              { list: ["C- und C++-Compiler, make, perl, cmake, meson, ninja und libclang", "nasm auf x86", "Windows x86_64 (MSVC): fertige statische Bibliotheken, nur libclang wird gebraucht. `HWCODEC_NO_DOWNLOAD=1` verbietet den Download.", "Eigene Bibliotheken: `LIBVPX_STATIC_DIR`, `SVTAV1_STATIC_DIR`, `DAV1D_STATIC_DIR`, `HWENC_SDK_DIR` oder `HWCODEC_USE_SYSTEM_LIBS=1`"] },
            ],
          },
          {
            id: "api",
            title: "Die wichtigsten Typen",
            blocks: [
              {
                terms: [
                  ["Codec", "`Vp9` oder `Av1`"],
                  ["EncoderConfig", "Breite, Höhe, fps und Bitrate, dazu zeitliche Ebenen, Threads und Maximalgröße"],
                  ["VideoEncoder", "Kodiert Frames und ändert Auflösung und Bitrate im Betrieb"],
                  ["VideoDecoder", "Dekodiert AV1 oder VP9 zu `I420Frame`"],
                  ["open_best_encoder", "Öffnet den ersten funktionierenden Encoder einer Reihenfolge"],
                  ["detect_encoders", "Prüft alle Hardware-Encoder und liefert einen `EncoderReport` je Encoder"],
                  ["convert", "Farbumrechnung, etwa `bgra_to_i420` für Bildschirmaufnahmen"],
                  ["selftest", "Misst, ob AV1 in Software auf dieser CPU in Echtzeit läuft"],
                ],
              },
              { p: "Die vollständige Referenz mit allen Typen steht auf docs.rs." },
            ],
          },
          {
            id: "getestet",
            title: "Getestete Hardware",
            blocks: [
              { p: "Getestet ist bisher VA-API mit AV1 auf einer AMD Radeon RX 9070 XT unter Linux (Mesa 26.2.5). NVENC, AMF, Quick Sync und VA-API mit Intel oder VP9 sind noch ungetestet. Hilf mit: Führe `cargo run --example detect` aus und schick die Ausgabe in einem Issue." },
              { p: "Für 0.2 geplant: Dekodieren in Hardware und eine Qualitätsvorgabe." },
            ],
          },
        ],
      },
      bgmatte: {
        title: "bgmatte",
        menu: "Kamera-Hintergründe in Echtzeit",
        description: "bgmatte ist eine Rust-Bibliothek für Hintergrund-Unschärfe und Hintergrundbilder bei Kamerabildern: Personen-Segmentierung mit ONNX Runtime, saubere Kanten, ohne Flackern.",
        lead: "Hintergrund-Unschärfe und Hintergrundbilder für Kamerabilder in Echtzeit, in Rust. Die Person erkennt ein mitgeliefertes Segmentierungsmodell über ONNX Runtime auf der CPU, Kanten und Übergänge bleiben sauber. Mumcord nutzt bgmatte für die Kamera-Hintergründe.",
        status: "Version 0.1, best effort: Gemessen auf wenigen Rechnern, Berichte sind willkommen.",
        highlights: [
          { title: "Personen-Segmentierung", body: "Der MediaPipe Selfie Segmenter läuft über ONNX Runtime auf der CPU. Beide Modelle sind dabei, nichts wird beim Bauen oder zur Laufzeit heruntergeladen." },
          { title: "Saubere Kanten", body: "Ein Guided Filter legt die Maske in voller Auflösung an Haare und Schultern, und eine zeitliche Glättung nimmt das Flackern, ohne Geisterbilder." },
          { title: "Unschärfe oder Bild", body: "Hintergrund mit einstellbarer Stärke unscharf oder durch ein Bild ersetzt, mit einem Light Wrap, der die Farbe des Hintergrunds an die Kante der Person bringt." },
          { title: "Passt sich an", body: "Qualität Auto, Best oder Light. Auto misst, was der Rechner schafft, und schaltet zurück, wenn er nicht mitkommt oder auf Akku läuft." },
          { title: "Bild rein, Bild raus", body: "NV12 direkt an Ort und Stelle, RGB oder RGBA. Einmal warm, braucht ein Frame keine einzige Speicheranforderung." },
          { title: "Schnell", body: "Etwa 8 ms pro 720p-Frame auf der vollen Stufe und unter 5 ms auf der leichten, auf einem CPU-Kern." },
        ],
        sections: [
          { id: "installation", title: "Installation", blocks: [
            { code: "bgmatteInstall", beforeRelease: "bgmatte ist noch nicht auf crates.io. Bis dahin steht der Quellcode auf GitHub." },
            { p: "bgmatte bringt ONNX Runtime nicht mit und lädt es nie herunter. Deine Anwendung liefert die Bibliothek (Version 1.23 oder neuer, getestet mit 1.23.2), bgmatte lädt sie zur Laufzeit. Fehlt sie, startet dein Programm trotzdem: Die Effekte melden `Error::Unavailable` mit dem Grund, und die Bilder bleiben unverändert." },
          ] },
          { id: "schnellstart", title: "Schnellstart", blocks: [
            { p: "Den Hintergrund jedes Kamerabilds unscharf machen:" },
            { code: "bgmatteBlur" },
            { p: "Den Hintergrund stattdessen durch ein Bild ersetzen:" },
            { code: "bgmatteImage" },
            { p: "`Effects::set_background`, `set_quality` und `set_on_battery` ändern den Effekt, während weiter Bilder kommen. Die Beispiele im Repository zeigen ganze Programme:" },
            { code: "bgmatteRun" },
          ] },
          { id: "onnx-runtime", title: "ONNX Runtime finden", blocks: [
            { list: ["`bgmatte::init_runtime(path)` mit dem Pfad zur Bibliothek, etwa neben deinem Programm. Vor dem ersten Bild aufrufen.", "Die Umgebungsvariable `ORT_DYLIB_PATH`.", "Der Bibliotheksname der Plattform (`onnxruntime.dll`, `libonnxruntime.so`, `libonnxruntime.dylib`) im Suchpfad des Systems."] },
            { p: "Die offiziellen CPU-Builds gibt es in den ONNX-Runtime-Releases von Microsoft. `bgmatte::availability()` sagt, ob das Laden geklappt hat und warum nicht." },
          ] },
          { id: "bilder", title: "Bildformate", blocks: [
            { table: { head: ["Format", "Aufbau", "Verarbeitung"], rows: [["NV12", "Y-Ebene, dann U/V verschränkt in halber Auflösung, BT.601 limited range", "An Ort und Stelle"], ["RGB", "3 Byte pro Pixel", "Nach NV12 umgerechnet, verarbeitet, geänderte Pixel zurück"], ["RGBA", "4 Byte pro Pixel", "Wie RGB; Alpha bleibt unberührt"]] } },
            { p: "Zeilen müssen lückenlos liegen, beide Seiten mindestens 64 Pixel und durch 8 teilbar. Pixel der Person behalten in jedem Format exakt ihre Werte. Bilder einer Kamera der Reihe nach mit ihrem Aufnahmezeitpunkt übergeben: Die Glättung merkt sich den Verlauf." },
          ] },
          { id: "qualitaet", title: "Qualitätsstufen", blocks: [
            { table: { head: ["Einstellung", "Verhalten"], rows: [["`Quality::Best`", "Immer die volle Stufe: quadratisches Modell bei jedem Bild, Guided-Filter-Kanten, Light Wrap bei Bildern, feinere Unschärfe."], ["`Quality::Light`", "Immer die leichte Stufe: Querformat-Modell mit 15 fps, einfachere Kanten, gröbere Unschärfe. Etwa die halbe Arbeit."], ["`Quality::Auto`", "Misst die volle Stufe auf den ersten Bildern und behält sie, wenn sie in 60 % des Bildintervalls passt. Schaltet nach 3 s über dem Budget oder auf Akku zurück und nach 30 s darunter am Netz wieder hoch."]] } },
          ] },
          { id: "leistung", title: "Leistung", blocks: [
            { table: { head: ["Fall", "Median", "Davon Modell"], rows: [["Volle Stufe, Unschärfe", "8,3 ms", "3,5 ms"], ["Volle Stufe, Bild", "6,5 ms", "3,5 ms"], ["Leichte Stufe, Unschärfe", "4,7 ms", "0,8 ms"], ["Leichte Stufe, Bild", "2,9 ms", "0,8 ms"], ["Volle Stufe, Unschärfe, RGBA-Bild", "16,3 ms", "3,5 ms"]] } },
            { p: "Median pro 1280×720-Bild mit `cargo run --release --example bench` auf einem AMD Ryzen 7 5800X3D (ein Kern für das Modell), ONNX Runtime 1.23.2 unter Linux." },
          ] },
          { id: "api", title: "Die wichtigsten Typen", blocks: [
            { terms: [["Effects", "Der Effekt für eine Kamera: Hintergrund, Qualität, Akku-Modus und Statistiken"], ["Config", "Bildrate und Hintergrund zum Start"], ["Background", "`Blur { strength }` oder `Image(Arc<BackgroundImage>)`"], ["Frame", "Ein Bild als NV12, RGB oder RGBA"], ["Pipeline", "Die Arbeit an einem Bild, eine pro Bildgröße"], ["Segmenter, OnnxSegmenter", "Erzeugt die Maske; eigene Umsetzungen sind möglich, etwa für Tests"], ["LevelController", "Macht aus gemessenen Bildzeiten eine Stufe"]] },
            { p: "Die vollständige Referenz steht in der API-Dokumentation (`cargo doc --open`)." },
          ] },
          { id: "grenzen", title: "Grenzen und Modelle", blocks: [
            { list: ["Nur CPU: GPU-Execution-Provider von ONNX Runtime nutzt 0.1 nicht.", "Gemacht für Videocalls: ein oder zwei Leute nah an der Kamera. Viele Leute weit weg oder gar niemand geben schwache Masken.", "Bildseiten durch 8 teilbar, Zeilen ohne Auffüllung.", "RGB- und RGBA-Bilder brauchen etwa doppelt so lange wie NV12."] },
            { p: "Die beiden Modelle sind der MediaPipe Selfie Segmenter von Google (256×256 und 256×144) in den ONNX-Fassungen der ONNX Community, unter Apache-2.0. Wer bgmatte ausliefert, sollte die NOTICE-Datei mitliefern." },
          ] },
        ],
      },
      protocol: {
        title: "mumble-client-protocol",
        menu: "Das Mumble-Protokoll für Rust",
        description: "mumble-client-protocol ist die Client-Seite des Mumble-Protokolls für Rust: TLS-Steuerkanal, Serverzustand, verschlüsselte UDP-Sprache und Server-Abfragen.",
        lead: "Die Client-Seite des Mumble-Protokolls für Rust: TLS-Steuerkanal, alle Protobuf-Nachrichten, der Serverzustand und die verschlüsselte Sprachübertragung über UDP. Auf dieser Bibliothek läuft Mumcords ganze Verbindung zum Server, und du kannst damit eigene Clients und Bots bauen.",
        status: "Version 0.1: Bis 1.0 kann sich die Schnittstelle noch ändern.",
        highlights: [
          { title: "Steuerkanal", body: "TLS mit optionalem Client-Zertifikat, Anmeldung und jede Protobuf-Nachricht. Befehle gehen über einen `Handle`, alles vom Server kommt als `Event`. Ob du einem Zertifikat traust, entscheidest du selbst." },
          { title: "Serverzustand", body: "Kanalbaum, Nutzer und Server-Einstellungen bleiben automatisch aktuell." },
          { title: "Befehle", body: "Textnachrichten, Kanäle betreten und verwalten, Flüstern und Rufen, Kanälen zuhören, ACLs, Kick und Bann, Bannliste, registrierte Nutzer, Rechte und Plugin-Daten." },
          { title: "Sprache über UDP", body: "Verschlüsselt mit OCB2-AES128, im alten und im Protobuf-Paketformat. Ist UDP blockiert, geht die Sprache durch den TCP-Tunnel und kehrt zurück, sobald UDP wieder geht." },
          { title: "Server-Abfrage", body: "Version, Nutzerzahl und Limit per UDP-Ping, ohne sich zu verbinden. Ohne eigenes Netzwerk: Du schickst das Datagramm selbst." },
          { title: "Rate-Limits eingebaut", body: "Nachrichten, die der Server begrenzt, gehen erst gebündelt und dann in einer Warteschlange raus. `Handle::disconnect` sendet vorher alles ab." },
        ],
        sections: [
          {
            id: "installation",
            title: "Installation",
            blocks: [
              { code: "protocolInstall", note: "Die Bibliothek braucht tokio. TLS läuft über rustls mit ring, ganz ohne OpenSSL, und die Protobuf-Dateien werden ohne installiertes protoc gebaut." },
            ],
          },
          {
            id: "schnellstart",
            title: "Schnellstart",
            blocks: [
              { p: "Verbinden und Textnachrichten mitlesen:" },
              { code: "protocolConnect" },
              { p: "Das Beispiel `text_bot` antwortet auf `!ping`:" },
              { code: "protocolBot" },
              { p: "Texte, Namen und Kommentare vom Server sind nicht vertrauenswürdig. Bereinige sie, bevor du sie als HTML anzeigst." },
            ],
          },
          {
            id: "kompatibilitaet",
            title: "Kompatibilität",
            blocks: [
              { p: "Die Bibliothek spricht mit normalen, unveränderten Mumble-Servern und ist live gegen Mumble 1.5, 1.4 und 1.3 getestet. Was einen neueren Server braucht, etwa Kanälen zuhören oder Plugin-Daten, lehnt sie auf älteren mit einem Fehler ab." },
            ],
          },
          {
            id: "nicht-enthalten",
            title: "Nicht enthalten",
            blocks: [
              { list: ["Audio aufnehmen und abspielen, der Opus-Codec, Jitter-Buffer und Mischen: Die Übertragung trägt fertig kodierte Opus-Frames.", "Oberfläche", "Server-Code"] },
              { p: "Das macht Mumcord selbst, oben auf der Bibliothek." },
            ],
          },
          {
            id: "api",
            title: "Die wichtigsten Typen",
            blocks: [
              {
                terms: [
                  ["connect", "Baut die Verbindung auf und meldet an; liefert eine `Connection` mit `events` und `Handle`"],
                  ["ConnectConfig", "Host, Port, Name, Passwort, Zugangs-Tokens, Identität, Zertifikatsprüfung und Login-Timeout"],
                  ["Handle", "Befehle an den Server, dazu `flush`, `disconnect` und `closed`"],
                  ["Event", "Alles, was vom Server kommt, etwa `TextMessage` oder `Disconnected`"],
                  ["ServerState", "Kanäle, Nutzer und Server-Infos, immer aktuell"],
                  ["voice::VoiceTransport", "Sprache senden und empfangen über UDP oder den TCP-Tunnel, mit Statistiken"],
                  ["query", "`encode_query` und `decode_answer` für den Server-Ping"],
                  ["CertVerifier, cert_hash", "Zertifikate prüfen und anpinnen"],
                  ["PacketTap", "Pakete beobachten, etwa für einen Paket-Inspektor"],
                ],
              },
              { p: "Die vollständige Referenz mit allen Typen steht auf docs.rs." },
            ],
          },
          {
            id: "tests",
            title: "Tests gegen echte Server",
            blocks: [
              { p: "Das Repository bringt Mumble-Server 1.3, 1.4 und 1.5 in Docker mit (`testenv/`). Die Live-Tests laufen so:" },
              { code: "protocolTests" },
            ],
          },
        ],
      },
    },
  },
  en: {
    label: "Library",
    contents: "On this page",
    release: "Latest version",
    noRelease: "No release yet",
    license: "License",
    copy: "Copy",
    copied: "Copied",
    source: "Source code",
    docsRs: "API reference on docs.rs",
    crates: "crates.io",
    issues: "Ideas and bugs",
    changelog: "Changelog",
    alsoTitle: "Also from Mumcord",
    pages: {
      hwcodec: {
        title: "hwcodec",
        menu: "AV1 and VP9 encoding, no FFmpeg",
        description: "hwcodec is a Rust library for realtime AV1 and VP9 video: NVENC, Quick Sync, AMF and VA-API in hardware, SVT-AV1, libvpx and dav1d in software.",
        lead: "Realtime AV1 and VP9 video for Rust, without FFmpeg. Hardware encoders (NVENC, Quick Sync, AMF, VA-API) and software codecs (SVT-AV1, libvpx, dav1d) behind one interface. Mumcord uses hwcodec for screen sharing and camera.",
        status: "Version 0.1, best effort: only part of the hardware has been tested by us.",
        highlights: [
          { title: "One interface", body: "An encoder is a `VideoEncoder`, whether it runs on the GPU or the CPU. `open_best_encoder` picks the best one that really works on this machine." },
          { title: "No FFmpeg", body: "hwcodec loads the GPU driver libraries at runtime. A program starts on machines without a matching GPU too and falls back to software." },
          { title: "Built for live video", body: "Low latency, up to 120 fps, resolution and bitrate change on the fly. AV1 and VP9 with three temporal layers: a sender can drop layers for single viewers without re-encoding." },
          { title: "Says what works and why not", body: "`detect_encoders` checks every encoder and names the device, the driver version or the reason it doesn't run here." },
          { title: "Only what you need", body: "Every codec is a Cargo feature. Without features the build needs no C compiler, no libclang and no pkg-config." },
          { title: "Quiet", body: "The library stores nothing and prints nothing. Diagnostics go through the `log` crate." },
        ],
        sections: [
          {
            id: "installation",
            title: "Installation",
            blocks: [
              { code: "hwcodecInstall" },
              { p: "All codecs are on by default. If you need only some, turn off the default features and pick your own:" },
              { code: "hwcodecSubset", note: "The first build takes a few minutes, because the bundled codec sources are built." },
            ],
          },
          {
            id: "quick-start",
            title: "Quick start",
            blocks: [
              { p: "Which AV1 encoders work on this machine?" },
              { code: "hwcodecDetect" },
              { p: "Open the best encoder, hardware first, software as the fallback. Pass your own order with `Some(&[EncoderKind::Software])`; `default_order(codec)` returns the default one." },
              { code: "hwcodecBest" },
              { p: "The examples in the repository run as they are. `encode_decode` encodes and decodes in software and needs no GPU:" },
              { code: "hwcodecRun" },
            ],
          },
          {
            id: "platforms",
            title: "Encoders and platforms",
            blocks: [
              {
                table: {
                  head: ["Encoder", "Windows", "Linux", "macOS", "Codecs"],
                  rows: [
                    ["NVIDIA NVENC", yes, yes, no, "AV1"],
                    ["VA-API (Mesa AMD, Intel media driver)", no, yes, no, "AV1, VP9"],
                    ["AMD AMF", yes, no, no, "AV1"],
                    ["Intel Quick Sync (oneVPL)", yes, no, no, "AV1, VP9"],
                    ["Software (SVT-AV1, libvpx)", yes, yes, yes, "AV1, VP9"],
                  ],
                },
              },
              { p: "In 0.1 decoding runs in software: dav1d for AV1, libvpx for VP9. macOS has software only so far; VideoToolbox is planned. FreeBSD is best effort and untested, Android and iOS are compile-checked only." },
            ],
          },
          {
            id: "features",
            title: "Cargo features",
            blocks: [
              {
                table: {
                  head: ["Feature", "Enables"],
                  rows: [
                    ["`nvenc`", "NVIDIA NVENC (Windows, Linux)"],
                    ["`amf`", "AMD AMF (Windows)"],
                    ["`qsv`", "Intel Quick Sync through oneVPL (Windows)"],
                    ["`vaapi`", "VA-API (Linux)"],
                    ["`svt-av1`", "AV1 encoder in software (SVT-AV1)"],
                    ["`libvpx`", "VP9 encoder and decoder"],
                    ["`dav1d`", "AV1 decoder"],
                  ],
                },
              },
              { p: "Hardware features compile to nothing on other platforms. When a codec is off, its type doesn't exist, and `open_best_encoder` or `open_software_decoder` return `Error::NotBuilt`." },
            ],
          },
          {
            id: "building",
            title: "Building",
            blocks: [
              { list: ["C and C++ compiler, make, perl, cmake, meson, ninja and libclang", "nasm on x86", "Windows x86_64 (MSVC): prebuilt static libraries, only libclang is needed. `HWCODEC_NO_DOWNLOAD=1` forbids the download.", "Your own libraries: `LIBVPX_STATIC_DIR`, `SVTAV1_STATIC_DIR`, `DAV1D_STATIC_DIR`, `HWENC_SDK_DIR` or `HWCODEC_USE_SYSTEM_LIBS=1`"] },
            ],
          },
          {
            id: "api",
            title: "The main types",
            blocks: [
              {
                terms: [
                  ["Codec", "`Vp9` or `Av1`"],
                  ["EncoderConfig", "Width, height, fps and bitrate, plus temporal layers, threads and maximum size"],
                  ["VideoEncoder", "Encodes frames and changes resolution and bitrate on the fly"],
                  ["VideoDecoder", "Decodes AV1 or VP9 to an `I420Frame`"],
                  ["open_best_encoder", "Opens the first working encoder of an order"],
                  ["detect_encoders", "Checks all hardware encoders and returns an `EncoderReport` for each"],
                  ["convert", "Colour conversion, such as `bgra_to_i420` for screen captures"],
                  ["selftest", "Measures whether software AV1 runs in real time on this CPU"],
                ],
              },
              { p: "The full reference with every type is on docs.rs." },
            ],
          },
          {
            id: "tested",
            title: "Tested hardware",
            blocks: [
              { p: "So far VA-API with AV1 on an AMD Radeon RX 9070 XT under Linux (Mesa 26.2.5) is tested. NVENC, AMF, Quick Sync and VA-API with Intel or VP9 are still untested. Help out: run `cargo run --example detect` and post the output in an issue." },
              { p: "Planned for 0.2: hardware decoding and a quality preset." },
            ],
          },
        ],
      },
      bgmatte: {
        title: "bgmatte",
        menu: "Camera backgrounds in real time",
        description: "bgmatte is a Rust library for background blur and background images in camera pictures: person segmentation with ONNX Runtime, clean edges, no flicker.",
        lead: "Realtime background blur and background replacement for camera pictures, in Rust. A bundled segmentation model finds the person through ONNX Runtime on the CPU, and edges and transitions stay clean. Mumcord uses bgmatte for its camera backgrounds.",
        status: "Version 0.1, best effort: measured on few machines, reports are welcome.",
        highlights: [
          { title: "Person segmentation", body: "The MediaPipe Selfie Segmenter runs through ONNX Runtime on the CPU. Both models are bundled; nothing is downloaded at build or run time." },
          { title: "Clean edges", body: "A guided filter snaps the mask to hair and shoulders at full resolution, and temporal smoothing removes flicker without ghosting." },
          { title: "Blur or image", body: "Blur the background with adjustable strength or replace it with a picture, with a light wrap that lets the background's colour touch the person's edge." },
          { title: "Adapts itself", body: "Quality Auto, Best or Light. Auto measures what the machine can do and steps down when it falls behind or runs on battery." },
          { title: "Frame in, frame out", body: "NV12 in place, RGB or RGBA. Once warmed up, processing a frame allocates nothing." },
          { title: "Fast", body: "About 8 ms per 720p frame at the full level and under 5 ms at the light level, on one CPU core." },
        ],
        sections: [
          { id: "installation", title: "Installation", blocks: [
            { code: "bgmatteInstall", beforeRelease: "bgmatte is not on crates.io yet. Until then the source code is on GitHub." },
            { p: "bgmatte does not ship ONNX Runtime and never downloads it. Your application provides the library (version 1.23 or newer, tested with 1.23.2) and bgmatte loads it at run time. Without it your program still starts: the effects report `Error::Unavailable` with the reason, and frames pass unchanged." },
          ] },
          { id: "quick-start", title: "Quick start", blocks: [
            { p: "Blur the background of every camera frame:" },
            { code: "bgmatteBlur" },
            { p: "Replace the background with a picture instead:" },
            { code: "bgmatteImage" },
            { p: "`Effects::set_background`, `set_quality` and `set_on_battery` change the effect while frames keep coming. The examples in the repository show complete programs:" },
            { code: "bgmatteRun" },
          ] },
          { id: "onnx-runtime", title: "Finding ONNX Runtime", blocks: [
            { list: ["`bgmatte::init_runtime(path)` with the library's path, for example next to your executable. Call it before the first frame.", "The environment variable `ORT_DYLIB_PATH`.", "The platform's library name (`onnxruntime.dll`, `libonnxruntime.so`, `libonnxruntime.dylib`) on the system's library search path."] },
            { p: "The official CPU builds are in Microsoft's ONNX Runtime releases. `bgmatte::availability()` tells you whether loading worked and why not." },
          ] },
          { id: "frames", title: "Frames", blocks: [
            { table: { head: ["Format", "Layout", "How it is processed"], rows: [["NV12", "Y plane, then interleaved U/V at half resolution, BT.601 limited range", "In place"], ["RGB", "3 bytes per pixel", "Converted to NV12, processed, changed pixels converted back"], ["RGBA", "4 bytes per pixel", "Like RGB; alpha is left untouched"]] } },
            { p: "Rows must be tightly packed, both sides at least 64 pixels and divisible by 8. The person's pixels keep their exact values in every format. Feed one camera's frames in order with their capture timestamps: the smoothing keeps history." },
          ] },
          { id: "quality", title: "Quality levels", blocks: [
            { table: { head: ["Setting", "Behaviour"], rows: [["`Quality::Best`", "Always the full level: square model on every frame, guided-filter edges, light wrap for images, finer blur."], ["`Quality::Light`", "Always the light level: landscape model at 15 fps, simpler edges, coarser blur. About half the work."], ["`Quality::Auto`", "Measures the full level on the first frames and keeps it if it fits 60 % of the frame interval. Steps down after 3 s over budget or on battery, and back up after 30 s under budget on mains power."]] } },
          ] },
          { id: "performance", title: "Performance", blocks: [
            { table: { head: ["Case", "Median", "Model share"], rows: [["Full level, blur", "8.3 ms", "3.5 ms"], ["Full level, image", "6.5 ms", "3.5 ms"], ["Light level, blur", "4.7 ms", "0.8 ms"], ["Light level, image", "2.9 ms", "0.8 ms"], ["Full level, blur, RGBA frame", "16.3 ms", "3.5 ms"]] } },
            { p: "Median per 1280×720 frame from `cargo run --release --example bench` on an AMD Ryzen 7 5800X3D (one core for the model), with ONNX Runtime 1.23.2 on Linux." },
          ] },
          { id: "api", title: "The main types", blocks: [
            { terms: [["Effects", "The effect for one camera: background, quality, battery mode and stats"], ["Config", "Frame rate and background to start with"], ["Background", "`Blur { strength }` or `Image(Arc<BackgroundImage>)`"], ["Frame", "One picture as NV12, RGB or RGBA"], ["Pipeline", "The work on one frame, one per frame size"], ["Segmenter, OnnxSegmenter", "Makes the mask; your own implementation works too, for example in tests"], ["LevelController", "Turns measured frame times into a level"]] },
            { p: "The full reference is in the API documentation (`cargo doc --open`)." },
          ] },
          { id: "limits", title: "Limits and models", blocks: [
            { list: ["CPU only: 0.1 does not use ONNX Runtime's GPU execution providers.", "Made for video calls: one or two people near the camera. Several people far away, or nobody, give weak masks.", "Frame sides divisible by 8, rows without padding.", "RGB and RGBA frames take about twice the time of NV12."] },
            { p: "The two models are Google's MediaPipe Selfie Segmenter (256×256 and 256×144) in the ONNX Community's conversions, under Apache-2.0. Applications that ship bgmatte should ship the NOTICE file too." },
          ] },
        ],
      },
      protocol: {
        title: "mumble-client-protocol",
        menu: "The Mumble protocol for Rust",
        description: "mumble-client-protocol is the client side of the Mumble protocol for Rust: TLS control channel, server state, encrypted UDP voice and server queries.",
        lead: "The client side of the Mumble protocol for Rust: the TLS control channel, every protobuf message, the server state and the encrypted voice transport over UDP. Mumcord's whole connection to the server runs on this library, and you can build your own clients and bots with it.",
        status: "Version 0.1: the interface may still change before 1.0.",
        highlights: [
          { title: "Control channel", body: "TLS with an optional client certificate, login and every protobuf message. Commands go through a `Handle`, everything from the server arrives as an `Event`. Whether you trust a certificate is your call." },
          { title: "Server state", body: "Channel tree, users and server settings stay up to date on their own." },
          { title: "Commands", body: "Text messages, joining and managing channels, whisper and shout, channel listening, ACLs, kick and ban, the ban list, registered users, permissions and plugin data." },
          { title: "Voice over UDP", body: "Encrypted with OCB2-AES128, in the legacy and the protobuf packet format. When UDP is blocked, voice goes through the TCP tunnel and returns as soon as UDP works again." },
          { title: "Server query", body: "Version, user count and limit by UDP ping, without connecting. No networking of its own: you send the datagram." },
          { title: "Rate limits built in", body: "Messages the server limits go out in a burst, then from a queue. `Handle::disconnect` sends everything first." },
        ],
        sections: [
          {
            id: "installation",
            title: "Installation",
            blocks: [
              { code: "protocolInstall", note: "The library needs tokio. TLS runs on rustls with ring, no OpenSSL, and the protobuf files build without an installed protoc." },
            ],
          },
          {
            id: "quick-start",
            title: "Quick start",
            blocks: [
              { p: "Connect and read text messages:" },
              { code: "protocolConnect" },
              { p: "The `text_bot` example answers `!ping`:" },
              { code: "protocolBot" },
              { p: "Text, names and comments from the server are untrusted. Sanitise them before you show them as HTML." },
            ],
          },
          {
            id: "compatibility",
            title: "Compatibility",
            blocks: [
              { p: "The library talks to standard, unmodified Mumble servers and is tested live against Mumble 1.5, 1.4 and 1.3. Features that need a newer server, such as channel listening or plugin data, are refused with an error on older ones." },
            ],
          },
          {
            id: "not-included",
            title: "Not included",
            blocks: [
              { list: ["Audio capture and playback, the Opus codec, jitter buffer and mixing: the transport carries encoded Opus frames.", "User interface", "Server code"] },
              { p: "Mumcord does those itself, on top of the library." },
            ],
          },
          {
            id: "api",
            title: "The main types",
            blocks: [
              {
                terms: [
                  ["connect", "Connects and logs in; returns a `Connection` with `events` and a `Handle`"],
                  ["ConnectConfig", "Host, port, name, password, access tokens, identity, certificate check and login timeout"],
                  ["Handle", "Commands to the server, plus `flush`, `disconnect` and `closed`"],
                  ["Event", "Everything the server sends, such as `TextMessage` or `Disconnected`"],
                  ["ServerState", "Channels, users and server info, always current"],
                  ["voice::VoiceTransport", "Sends and receives voice over UDP or the TCP tunnel, with statistics"],
                  ["query", "`encode_query` and `decode_answer` for the server ping"],
                  ["CertVerifier, cert_hash", "Check and pin certificates"],
                  ["PacketTap", "Watch packets, for example for a packet inspector"],
                ],
              },
              { p: "The full reference with every type is on docs.rs." },
            ],
          },
          {
            id: "tests",
            title: "Tests against real servers",
            blocks: [
              { p: "The repository ships Mumble servers 1.3, 1.4 and 1.5 in Docker (`testenv/`). Run the live tests like this:" },
              { code: "protocolTests" },
            ],
          },
        ],
      },
    },
  },
};

/** Other languages use the English page, which their routes point to. */
export const libText = (lang: string): LibsPage => (lang === "de" ? libsPage.de : libsPage.en);
