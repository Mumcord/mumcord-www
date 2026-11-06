# Mumcord crash reports

A small service that receives crash reports from the Mumcord desktop app (only sent with the
user's consent), groups them, and gives the maintainer a passkey-protected admin page with
GitHub issue creation and an optional AI pre-analysis by Claude Haiku.

Production: `https://crash.mumcord.app`, behind Traefik as the TLS proxy.

- Node 24 runs the TypeScript directly (type stripping), no build step.
- Hono + `@hono/node-server`, SQLite via the built-in `node:sqlite`. No native modules.
- Admin login with passkeys (`@simplewebauthn/server` and `@simplewebauthn/browser`).

## Layout

```
src/server.ts       entry point (env, SQLite file, HTTP server)
src/app.ts          routes: ingest, auth, admin API, static UI
src/report.ts       parser for the plain-text crash file
src/validate.ts     JSON variant of the ingest body
src/fingerprint.ts  grouping key: kind/signal + cause + top app frames
src/source.ts       file:line extraction and snippet fetching from GitHub
src/ai.ts           Claude Haiku analysis (structured JSON output)
src/github.ts       issue body and GitHub REST call
src/auth.ts         WebAuthn, sessions, CSRF guard
src/db.ts           SQLite schema and queries
public/             admin UI (plain HTML/CSS/JS)
test/               node:test tests, test/fixtures/ holds real crash files
```

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `RP_ID` | host of `ORIGIN` | WebAuthn relying party ID, `crash.mumcord.app` in production |
| `ORIGIN` | `http://localhost:8787` | Public origin of the admin page, `https://crash.mumcord.app` in production |
| `SETUP_TOKEN` | (none) | Allows registering the first passkey at `/setup?token=…` |
| `PORT` | `8787` | Listen port |
| `DATA_DIR` | `./data` (`/data` in Docker) | Location of `crashreports.db` |
| `COOKIE_SECURE` | `1` if `ORIGIN` is https | Set `0` only for plain-http local testing |
| `TRUST_PROXY` | `0` | `1` behind Traefik: use the last `X-Forwarded-For` entry as the client address for the rate limit |
| `RATE_LIMIT_PER_MINUTE` | `10` | Reports per client address and minute |
| `GITHUB_REPO` | `Mumcord/mumcord` | Repo for issues and source snippets |
| `GITHUB_TOKEN` | (none) | Needed for "Create GitHub issue" (Issues: write). Also used for source fetches and code search |
| `ANTHROPIC_API_KEY` | (none) | Enables the AI analysis |
| `AI_INCLUDE_SOURCE` | `1` | Fetch source snippets from the public repo for the AI prompt |
| `AI_INCLUDE_LOGS` | `0` | `1` also sends the last log lines and the user note to Anthropic |
| `AI_TIMEOUT_MS` | `30000` | Timeout per AI request |

## Setup

```sh
cd crashreports
npm ci
npm test            # node:test, no network
npm run typecheck
SETUP_TOKEN=dev-token COOKIE_SECURE=0 npm start
# open http://localhost:8787/setup?token=dev-token and register a passkey
```

In production (Docker, see `Dockerfile`):

1. Build and run the image with a volume on `/data` and `RP_ID=crash.mumcord.app`,
   `ORIGIN=https://crash.mumcord.app`, `TRUST_PROXY=1` and a random `SETUP_TOKEN`
   (`openssl rand -hex 24`). Route `crash.mumcord.app` to port 8787 in Traefik.
2. Open `https://crash.mumcord.app/setup?token=<SETUP_TOKEN>` and register the first passkey.
   After that the setup page is closed; the token cannot register more passkeys.
3. Signed in, use "Add passkey" to register more devices. Sessions last 7 days
   (HttpOnly, Secure, SameSite=Strict cookie; the token is stored only as a hash).
4. Optionally remove `SETUP_TOKEN` from the environment.

The service never reads `X-Forwarded-Proto`: `ORIGIN` is fixed, and WebAuthn and the cookie
flags derive from it. `X-Forwarded-For` is only used with `TRUST_PROXY=1`, only for the
in-memory rate limit, and never stored.

## Ingest

`POST https://crash.mumcord.app/api/v1/reports`. The app uploads its crash file unchanged:

```sh
curl -sS https://crash.mumcord.app/api/v1/reports \
  -H 'Content-Type: text/plain; charset=utf-8' \
  --data-binary @crash-1794001864.txt
# {"id":"…","group":"<sha256 fingerprint>"}
```

The file starts with `Mumcord crash report`, then `key: value` header lines (`version`, `os`,
`time`, `kind` such as `panic` or `signal SIGSEGV`, `thread`, `cause`, `uptime`), then the sections
`running:`, `system:`, `backtrace:` (optional) and `last log lines:`. The raw text is stored as-is
and shown as "Raw report" in the admin page.

A JSON body (`Content-Type: application/json`) is accepted too, with `app_version`, `os`,
`os_version`, `arch`, `kind` (panic|crash|hang), `message`, `backtrace` and optional `log_tail`,
`user_note`, `install_id`. Unknown fields are rejected.

Limits: 256 KB per body, 10 reports per minute per client address. Responses: `201`, `400`
(invalid), `413` (too large), `415` (wrong content type), `429` (rate limited, with `Retry-After`).

### Grouping

The fingerprint is sha256 over:

- the kind, or `signal <NAME>` for signals,
- the cause with ` at <path>:<line>`, numbers, addresses and paths stripped,
- the top 5 app frames (symbol + repo path, no line numbers). App frames are those whose `at`
  path is repo-relative (`./crates/…`, `./src-tauri/…`, `./src/…`, or a CI build path such as
  `/home/runner/work/mumcord/mumcord/…`). Toolchain frames (`/rustc/…`), crates from the cargo
  registry, `<unknown>` and the panic hook `crates/engine/src/crash.rs` are skipped.

A signal without a backtrace gets a weak fingerprint: signal + thread + module of the last log
line (e.g. `mumcord_engine::screen_share`). The admin page marks such groups as "weak".

For useful frame locations, release builds should keep line tables:

```toml
[profile.release]
debug = "line-tables-only"
```

## Admin page

Group list with search, status filter (new / triaged / fixed / ignored), count, last seen and
versions. The detail view shows the AI analysis, the latest 20 reports with message, backtrace,
running/system context, log lines and raw report, a status selector, and delete buttons. At most
50 reports are kept per group.

All `/api/admin/*` routes need a session (401 otherwise). State-changing requests must send the
header `x-crashreports-csrf: 1` and, if the browser sends an `Origin`, it must equal `ORIGIN`.

## GitHub issues

"Create GitHub issue" posts to `GITHUB_REPO` with the AI title (or `Crash: <cause>`) and a short
body: kind, count, versions, OS list, first/last seen, the cause, the top app frames, the
running/system context of the latest report (camera, screen share, desktop, GPU and driver),
links to the source locations at the release tag, and the AI summary if there is one. Home
directory names in the cause are replaced with `~`. The issue URL is stored on the group.

## AI analysis

With `ANTHROPIC_API_KEY` set, every new group is analyzed in the background with
`claude-haiku-5-5` (ingest does not wait for it); "Re-analyze" runs it again. The model returns
structured JSON: `title`, `summary`, `likely_cause`, `component`, `severity`, `suggested_labels`,
`suspect_location` and `fix_hint`. Errors, refusals and timeouts are stored on the group and
shown in the page.

With `AI_INCLUDE_SOURCE=1` (default) the service takes file:line locations from the cause and the
app frames (at most 5), fetches each file at tag `v<version>` (falling back to `main`) from
raw.githubusercontent.com, or through the contents API when `GITHUB_TOKEN` is set, and adds
±40 numbered lines around each location (about 60 KB in total). Files are cached in memory.
When no location is found and `GITHUB_TOKEN` is set, a GitHub code search for a distinctive
phrase of the cause is tried.

## Privacy

- The client IP is never stored. It is used only in memory for the rate limit.
- Reports contain what the app writes: version, OS, kernel, desktop, CPU, GPU and driver, memory,
  screen sizes, what was running (camera, screen share, install type), the backtrace, and the
  last log lines. The JSON variant can also carry a user note and a random install ID.
- **To GitHub (public issue):** kind, counts, versions, OS list, timestamps, the cause (home
  directory names removed), the top app frames, the running/system context of the latest
  report, links into the public repo, and the AI summary. The user note and the log lines go
  there only if the admin ticks the checkbox for that issue. Never the raw report.
- **To Anthropic:** kind, cause, normalized top app frames, versions, OS list, thread, uptime,
  the running/system context, and source snippets from the public Mumcord repo. Log lines and
  the user note only with `AI_INCLUDE_LOGS=1`. Nothing is sent without `ANTHROPIC_API_KEY`.
- To GitHub for source snippets: only repo paths and the release tag, no report data (except
  the code search phrase taken from the cause, and only when `GITHUB_TOKEN` is set).
