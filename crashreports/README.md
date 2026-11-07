# Mumcord crash reports

A small service that receives crash reports from the Mumcord desktop app (only sent with the
user's consent), groups them, and gives the maintainers a protected admin page (passkey, or
password plus authenticator app) with
GitHub issue creation and an optional AI pre-analysis by Claude Haiku.

Production: `https://crash.mumcord.app`, behind Traefik as the TLS proxy.

- Node 24 runs the TypeScript directly (type stripping), no build step.
- Hono + `@hono/node-server`, SQLite via the built-in `node:sqlite`. No native modules.
- Admin login with passkeys (`@simplewebauthn/server` and `@simplewebauthn/browser`), or with
  username + password and a mandatory TOTP second factor (`node:crypto`; QR codes rendered
  server-side by the `qrcode` package).

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
src/mumbot.ts       channel card through the Mumbot webhook
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
| `SETUP_TOKEN` | (none) | Allows creating the first user at `/setup?token=…` |
| `TOTP_ENCRYPTION_KEY` | (none) | 32-byte key (base64 or hex) that encrypts the TOTP secrets (AES-256-GCM). Generate with `openssl rand -base64 32`. Unset (or `CHANGE_ME…`): password login is off, passkeys only |
| `PORT` | `8787` | Listen port |
| `DATA_DIR` | `./data` (`/data` in Docker) | Location of `crashreports.db` |
| `COOKIE_SECURE` | `1` if `ORIGIN` is https | Set `0` only for plain-http local testing |
| `TRUST_PROXY` | `0` | `1` behind Traefik: use the last `X-Forwarded-For` entry as the client address for the rate limit |
| `RATE_LIMIT_PER_MINUTE` | `10` | Reports per client address and minute |
| `REPORT_RETENTION_DAYS` | `90` | Reports are deleted this many days after they arrive |
| `GITHUB_REPO` | `Mumcord/mumcord` | Repo for issues and source snippets |
| `GITHUB_TOKEN` | (none) | Needed for "Create GitHub issue" (Issues: write). Also used for source fetches and code search |
| `ANTHROPIC_API_KEY` | (none) | Enables the AI analysis |
| `AI_INCLUDE_SOURCE` | `1` | Fetch source snippets from the public repo for the AI prompt |
| `AI_INCLUDE_LOGS` | `0` | `1` also sends the last log lines and the user note to Anthropic |
| `AI_TIMEOUT_MS` | `30000` | Timeout per AI request |
| `MUMBOT_WEBHOOK_URL` | (none) | Mumbot webhook `POST /message` URL, e.g. `http://mumbot:8080/message`. See "Mumbot webhook" |
| `MUMBOT_WEBHOOK_TOKEN` | (none) | Mumbot API key (a `[[keys]]` entry), sent as `X-API-Key` |
| `MUMBOT_CHANNEL` | (none) | Channel id (e.g. `42`), or its name, looked up once through Mumbot's `GET /channels` |
| `MUMBOT_GITHUB_CHANNEL` | `MUMBOT_CHANNEL` | Channel for the GitHub cards (webhook and daily statistics) |
| `GITHUB_WEBHOOK_SECRET` | (none) | Secret of the GitHub organisation webhook; without it `POST /api/github/webhook` answers 404. See "GitHub webhook" |
| `GITHUB_ORG` | `Mumcord` | Organisation for the daily statistics; empty turns them off |
| `GITHUB_STATS` | `1` | `0` turns the daily statistics off |
| `GITHUB_STATS_TIME` | `22:00` | Local time of the daily statistics card (`HH:MM`) |
| `GITHUB_STATS_TZ` | `Europe/Berlin` | IANA time zone of `GITHUB_STATS_TIME`; daylight saving time is followed |

## Setup

```sh
cd crashreports
npm ci
npm test            # node:test, no network
npm run typecheck
SETUP_TOKEN=dev-token COOKIE_SECURE=0 TOTP_ENCRYPTION_KEY=$(openssl rand -base64 32) npm start
# open http://localhost:8787/setup?token=dev-token, choose a username and a passkey or a password
```

In production (Docker, see `Dockerfile`):

1. Build and run the image with a volume on `/data` and `RP_ID=crash.mumcord.app`,
   `ORIGIN=https://crash.mumcord.app`, `TRUST_PROXY=1` and a random `SETUP_TOKEN`
   (`openssl rand -hex 24`), plus `TOTP_ENCRYPTION_KEY` (`openssl rand -base64 32`) if password
   login is wanted. Keep that key with the other secrets: without it the stored TOTP secrets
   cannot be read and every password user needs a reset. Route `crash.mumcord.app` to port 8787
   in Traefik.
2. Open `https://crash.mumcord.app/setup?token=<SETUP_TOKEN>`, choose a username and either a
   passkey or a password + authenticator app. After that the setup page is closed; the token
   cannot create more users.
3. Signed in, open "People & sign-in" to manage your own sign-in or to invite someone
   (see [Inviting people](#inviting-people)). Sessions last 7 days
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

### Users and sign-in

Every person is a user (username, unique and not case-sensitive; 2–40 letters, digits and
`. _ - @`). A user can sign in with passkeys, with a password + authenticator app, or both.
Databases from before users existed are migrated on start: each passkey becomes a user of its
own, named after the passkey (`first passkey` becomes `first-passkey`; duplicates get `-2`, …),
and its open sessions stay valid.

**Password policy** (checked by the server; the form shows the same checks live): 12 to 256
characters, at least one uppercase letter, one lowercase letter, one digit and one special
character (anything that is not a letter or digit, a space counts), must not contain the
username, and must not be on a small built-in list of very common passwords. Passwords are hashed
with scrypt (N=2^15, r=8, p=1, 16-byte salt, 64-byte key); the parameters are stored with the
hash.

**Authenticator app (TOTP, mandatory with a password):** RFC 6238, SHA-1, 6 digits, 30 seconds;
any common app works. Enrollment shows a QR code and the secret as text and is completed only
after the first valid code. Codes from one step before or after are accepted (clock drift); a
code is accepted only once. The secret is stored encrypted with AES-256-GCM under
`TOTP_ENCRYPTION_KEY`.

**Signing in with a password:** username and password first, then the 6-digit code (or a
recovery code). The second step lives on the server for 5 minutes and allows 5 attempts; only
after both steps a session is issued. Errors are generic ("Username or password is wrong"), and
unknown usernames take the same scrypt time. Failed passwords and codes count per account: after
5 failures in a row the account is locked for 1 minute, then 2, 4, … at most 1 hour; a complete
sign-in resets the counter. The sign-in routes also have a per-address rate limit of
`RATE_LIMIT_PER_MINUTE`. Failures are logged with the username only, never a password or code.

**Recovery:** enrollment creates 10 one-time recovery codes (`xxxxx-xxxxx`), shown once with a
download as `.txt`; only their SHA-256 hashes are stored. A recovery code works once in place of
the app code. Lost the app and the codes? Another admin resets your password + 2FA in "People &
sign-in" (this ends your sessions) and sends you an invite link for your account; through it you
set a new password and app, or register a passkey. If nobody else can sign in, there is no reset
through the UI: keep your recovery codes.

**"People & sign-in"** lists every user with their passkeys, whether password + 2FA is set up
and how many recovery codes are left. Under "My sign-in" you can:

- change your password (needs the current password and a code; your other sessions end),
- set up password + authenticator app if you only have passkeys, or add a passkey,
- regenerate the recovery codes (needs a code; the old ones stop working),
- reset the authenticator app (needs a current code or a recovery code; enrolls a new secret and
  ends your other sessions).

Any admin can delete other users and reset another user's password + 2FA; both end that user's
sessions right away. The last user who can still sign in (and the last way to sign in to the
service) can never be removed.

### Inviting people

Signed in, open "People & sign-in", enter an optional label (e.g. "Alex"), pick how long the link
stays valid (1 hour, 24 hours by default, or 7 days) and create the invite. The link
`<ORIGIN>/invite#<token>` is shown once with a copy button; send it over a private channel.

- The token is 32 random bytes and sits in the URL fragment, so it never reaches server or proxy
  logs. The invite page sends it only in request bodies; the server stores only its SHA-256 hash.
- The invitee opens the link, chooses a username and either registers a passkey (named after
  the label by default) or sets a password and enrolls the authenticator app. The invite is
  marked used in the same transaction that creates the user, so it works once. After that the
  invitee is signed in.
- An invite can also be created for an existing user without sign-in (after a reset); it then
  restores sign-in for that user instead of creating a new one.
- Expired, used and revoked links show a clear error. Open invites can be revoked; expired ones are
  deleted by the retention job. The invite routes and `/setup` share a rate limit of
  `RATE_LIMIT_PER_MINUTE` per client address.
- The passkey list shows name, user, created and last-used dates and who invited each one.
  Deleting a passkey ends its sessions right away; the last way to sign in cannot be deleted.

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

## Mumbot webhook

With `MUMBOT_WEBHOOK_URL`, `MUMBOT_WEBHOOK_TOKEN` and `MUMBOT_CHANNEL` set (values starting with
`CHANGE_ME` count as unset), the service posts a message card into a Mumble channel through a
[Mumbot](https://github.com/Mumcord/mumbot) webhook bot (0.5.x):

- when a **new group** appears: after its AI analysis has finished or failed (at most 30 s), right
  away when AI is off;
- when a group marked **fixed or ignored** comes back (regression).

Further reports of an open group post nothing, and a group gets at most one card per hour
(in-memory cooldown). Webhook errors are logged and never affect ingest; each request has a 5 s
timeout.

Mumbot's API is `POST /message` with the header `X-API-Key: <key>` and the body
`{"channel": <id>, "message": "<text>"}`; the channel must be a numeric id. Mumbot has no card
object (Mumcord/mumbot#13 was not planned) and escapes HTML, so the message is Mumcord's typed
BB code `[card …]…[/card]`, which Mumcord renders as a card (`docs/message-cards.md` in the Mumcord
repo). Official Mumble clients show the BB code as text. Mumbot turns lowercase `http(s)://` into
links, which would break a card attribute, so the card URL is sent as `HTTPS://…`; Mumcord accepts
it. Example:

```
[card title="Screen decoder returns no frame for a keyframe" color=error icon=error url="HTTPS://crash.mumcord.app/#/groups/<groupId>"]
**High** · screenshare
The decoder returns no frame for a keyframe and the demo panics instead of skipping it.
- Version: 0.7.1
- OS: linux x86_64
- Kind: panic
- Count: 1
- Suspect: `crates/engine/examples/crash_demo.rs:17`
[/card]
```

- Title: the AI title, else `Crash: <cause>` (home directories removed).
- Colour from the AI severity, else from the kind (signal/crash critical, panic high, hang medium):
  critical/high `error` (red), medium `warning` (orange), low no colour (Mumcord's neutral stripe).
- With AI: severity label, component and the summary (trimmed). Fields: versions, OS + arch of the
  report, kind, count, suspect location (AI, else the cause's `file:line`).
- Title and the "Open" button lead to `${ORIGIN}/#/groups/<groupId>`; the admin page opens that
  group after the passkey login.
- Never in the card: log lines, the user note, OS version, kernel, hardware or running context.
  The channel may be semi-public.

### Running Mumbot next to the service

Mumbot is configured by a `bot.toml` (it does not expand environment variables; only the server
password can come from `SERVER_PASSWORD`). The API key and channel passwords therefore have to be
in the file: render it from CI secrets at deploy time and mount it read-only. Keys:
Mumbot's `docs/configuration.md`.

```toml
# bot.toml (secret, never committed)
[server]
host = "mumble.example.org"
port = 64738
name = "Crash reports"
cert_name = "crash-reports"     # stable identity, no spaces
channel = "Crash reports"               # joined at login
# connect password: SERVER_PASSWORD env

[http]
listen = "0.0.0.0:8080"         # inside the container; not published to the host

[[keys]]
key = "CHANGE_ME_MUMBOT_KEY"    # openssl rand -hex 32, same value as MUMBOT_WEBHOOK_TOKEN
label = "crashreports"
channels = ["Crash reports"]

[[token]]                       # channel password (Mumble access token)
channel = "Crash reports"
password = "CHANGE_ME_CHANNEL_PASSWORD"
```

```yaml
services:
  crashreports:
    # … as before, plus:
    environment:
      MUMBOT_WEBHOOK_URL: http://mumbot:8080/message
      MUMBOT_WEBHOOK_TOKEN: ${MUMBOT_WEBHOOK_TOKEN}
      MUMBOT_CHANNEL: "Crash reports"      # or its numeric id
  mumbot:
    image: ghcr.io/mumcord/mumbot:0.5.1
    command: ["webhook"]          # only the webhook module
    restart: unless-stopped
    user: "10001:10001"
    read_only: true
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    environment:
      MUMBOT_CONFIG: /config/bot.toml
      SERVER_PASSWORD: ${MUMBLE_SERVER_PASSWORD}
      RUST_LOG: info
    volumes:
      - ./bot.toml:/config/bot.toml:ro
      - mumbot-data:/data           # client certificate = the bot's identity
volumes:
  mumbot-data:
```

No port is published: the crash service reaches Mumbot over the compose network. Mumbot warns at
start that HTTP on `0.0.0.0` is unencrypted; that traffic stays on the internal network. Check the
bot with `GET http://mumbot:8080/health` (`"connected":true`) and the key with
`GET /channels` (header `X-API-Key`).

## GitHub webhook

New issues and pull requests anywhere in the organisation are posted as cards into
`MUMBOT_GITHUB_CHANNEL` (default: `MUMBOT_CHANNEL`; a different channel must also be in the Mumbot
key's `channels` list). Setup:

1. `openssl rand -hex 32` → `GITHUB_WEBHOOK_SECRET` (deploy secret, never committed).
2. GitHub: organisation **Settings → Webhooks → Add webhook**:
   - Payload URL: `https://crash.mumcord.app/api/github/webhook`
   - Content type: `application/json`
   - Secret: the value from step 1
   - "Let me select individual events": **Issues** and **Pull requests** (nothing else)
3. GitHub sends a `ping`; the webhook page shows a green tick when the service answered 200.

Behaviour:

- Every request must carry a valid `X-Hub-Signature-256` (HMAC-SHA256 of the raw body, compared in
  constant time), else 401. Bodies over 1 MB get 413. Without `GITHUB_WEBHOOK_SECRET` the route is
  404.
- Cards go out for `issues` / `opened` and `pull_request` / `opened` or `ready_for_review`. Draft PRs
  wait until they are ready for review. Issues and PRs by bots (`type: Bot` or a login ending in
  `[bot]`, e.g. dependabot) are skipped. Other events and actions answer 202 and post nothing.
- Dedupe: the `X-GitHub-Delivery` id and the issue/PR (`repo#number`) are kept in SQLite for 7 days,
  so a redelivery, or a PR going back to draft and ready again, posts once.
- The service answers right away; the card is posted in the background and failures are logged.

```
[card title="New issue: Crash when joining a channel" color=info icon=info url="HTTPS://github.com/Mumcord/mumcord/issues/42"]
- Repo: Mumcord/mumcord
- Number: #42
- Author: octocat
- Labels: bug, audio
[/card]

[card title="New pull request: Add push to talk overlay" color=success icon=check url="HTTPS://github.com/Mumcord/mumcord/pull/7"]
- Repo: Mumcord/mumcord
- Number: #7
- Author: octocat
- Branches: main ← ptt-overlay
- Changes: +120 / −8
[/card]
```

Issues are `info` (blue), pull requests `success` (green). Labels appear when set; a branch from a
fork is shown as `owner:branch`. Title and "Open" lead to the issue or PR on github.com.

## Daily GitHub statistics

With the Mumbot webhook configured and `GITHUB_ORG` set (default `Mumcord`), the service posts one
card a day at `GITHUB_STATS_TIME` in `GITHUB_STATS_TZ` (default 22:00 Europe/Berlin; the next run is
computed with `Intl` in that zone, so it stays at 22:00 local across the DST changes). `GITHUB_STATS=0`
turns it off.

Numbers come from the public GitHub REST API, with `GITHUB_TOKEN` when set, else unauthenticated:

- followers: `GET /orgs/{org}`;
- stars: summed over all public repos that are neither archived nor forks
  (`GET /orgs/{org}/repos?type=public&per_page=100`, paginated);
- open issues and PRs: search `is:issue is:open org:{org}` and `is:pr is:open org:{org}`;
- new in 24 h: the same searches with `created:>=<now − 24 h>`.

Each day's numbers, including the stars per repo, are stored as a snapshot in SQLite. The card shows
the change against the previous snapshot and the three repos with the most new stars since then:

```
[card title="Mumcord on GitHub · 2026-11-07" icon=chart url="HTTPS://github.com/Mumcord"]
- Stars: ★ 128 (+3)
- Followers: 41 (+1)
- Open issues: 17 (−2)
- Open PRs: 4 (±0)
- New in 24 h: 3 issues, 1 PR
- Most new stars: mumcord +2, mumbot +1
[/card]
```

The day's snapshot is written before the card is posted and is the guard against a second card,
also across restarts. If the service was down at the run time and starts later the same day (before
midnight local time), it posts once at start. An API error (e.g. the rate limit) is logged and that
day's card is skipped (a restart the same evening tries again); nothing crashes.

## Privacy

- Retention: every report (raw text, log lines, system details) is deleted 90 days after it arrives, checked at start and every 6 hours. Groups keep only their aggregate: count, first/last seen, versions, status, analysis and issue link. Reports carry no install or user id, so a single report cannot be traced back to a person or deleted on request; the fixed retention is the safeguard.

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
- **To the Mumbot channel:** title, AI severity, component and summary, versions, OS + arch,
  kind, count, suspect location and the admin link. No log lines, user note or system details.
- To GitHub for source snippets: only repo paths and the release tag, no report data (except
  the code search phrase taken from the cause, and only when `GITHUB_TOKEN` is set).
