/**
 * Client setup snippets for the MCP endpoint and the /help/mcp page. The same snippets are shown
 * with `<token>` on the help page and with the real token on the one-time token panel.
 */

export const MCP_SERVER_NAME = 'mumcord-crashes';
/** Environment variable the pi and Claude Desktop snippets read the token from. */
export const TOKEN_ENV = 'MUMCORD_CRASH_TOKEN';

export interface ClientSetup {
  id: string;
  title: string;
  /** Short text above the code block. */
  intro: string;
  code: string;
  /** Text below the code block. */
  note: string;
  source: { label: string; url: string } | null;
}

export const mcpUrl = (origin: string): string => `${origin.replace(/\/+$/, '')}/mcp`;

export function clientSetups(origin: string, token = '<token>'): ClientSetup[] {
  const url = mcpUrl(origin);
  return [
    {
      id: 'claude-code',
      title: 'Claude Code',
      intro: 'Run in a terminal (add --scope user to make it available in every project):',
      code: `claude mcp add --transport http ${MCP_SERVER_NAME} ${url} --header "Authorization: Bearer ${token}"`,
      note: 'Check it with "claude mcp list" or /mcp inside Claude Code. Remove it with "claude mcp remove ' + MCP_SERVER_NAME + '".',
      source: { label: 'Claude Code docs: MCP', url: 'https://code.claude.com/docs/en/mcp' },
    },
    {
      id: 'claude-desktop',
      title: 'Claude Desktop / claude.ai (custom connector)',
      intro:
        'Pro/Max: Customize > Connectors > + Add > Add custom connector. Team/Enterprise: an owner adds it under Organization ' +
        'settings > Connectors > Add > Custom > Web. Enter the URL and, under "Request headers", the Authorization header:',
      code: `Name:            Mumcord crashes\nRemote MCP URL:  ${url}\nRequest header:  Authorization: Bearer ${token}`,
      note:
        "Custom connectors connect from Anthropic's cloud, not from your device, so the server must be reachable from the " +
        'public internet. They then work in Claude Desktop and on claude.ai.',
      source: { label: 'Claude Help Center: custom connectors', url: 'https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp' },
    },
    {
      id: 'claude-desktop-config',
      title: 'Claude Desktop (local config, via mcp-remote)',
      intro:
        'Alternative that connects from your own machine: claude_desktop_config.json runs local servers only, so the ' +
        'mcp-remote bridge (needs Node.js) forwards to the HTTP endpoint. Add this under Settings > Developer > Edit Config and restart Claude Desktop:',
      code: JSON.stringify(
        {
          mcpServers: {
            [MCP_SERVER_NAME]: {
              command: 'npx',
              args: ['-y', 'mcp-remote', url, '--header', 'Authorization:${AUTH_HEADER}'],
              env: { AUTH_HEADER: `Bearer ${token}` },
            },
          },
        },
        null,
        2,
      ),
      note: 'The header value sits in "env" without a space in "args", as the mcp-remote README recommends (works around a Windows quoting bug).',
      source: { label: 'mcp-remote README', url: 'https://github.com/geelen/mcp-remote' },
    },
    {
      id: 'pi',
      title: 'pi (coding agent)',
      intro:
        `pi has built-in MCP support (stdio and Streamable HTTP). Put the token in an environment variable, then add the server ` +
        `to ~/.pi/agent/mcp.json (or .pi/mcp.json in a trusted project); "\${${TOKEN_ENV}}" is read from the environment:`,
      code:
        `export ${TOKEN_ENV}=${token}\n\n` +
        `# ~/.pi/agent/mcp.json\n` +
        JSON.stringify({ mcpServers: { [MCP_SERVER_NAME]: { url, headers: { Authorization: `Bearer \${${TOKEN_ENV}}` } } } }, null, 2),
      note: `Or from the shell: pi mcp add ${MCP_SERVER_NAME} --url ${url} --bearer-token-env-var ${TOKEN_ENV}`,
      source: { label: 'pi docs: MCP', url: 'https://pi.dev/docs/latest/mcp' },
    },
    {
      id: 'other',
      title: 'Other MCP clients',
      intro: 'Any client that speaks Streamable HTTP and can send a header:',
      code: `URL:     ${url}\nHeader:  Authorization: Bearer ${token}`,
      note: 'The server is stateless: POST only, JSON responses, no session id.',
      source: null,
    },
  ];
}

export const EXAMPLE_PROMPTS = [
  'Which new crashes appeared since 0.7.1?',
  'Show the crash stats of the last 7 days. Which component crashes most?',
  'Summarize the top 3 open crash groups and their likely causes.',
  'Get the latest report of the most frequent SIGSEGV group and explain the backtrace.',
  'Are there crashes that only happen on one OS? List them with their versions.',
];

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function helpPage(origin: string): string {
  const blocks = clientSetups(origin)
    .map(
      (s) => `
    <section class="card help-block" id="${s.id}">
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.intro)}</p>
      <div class="code-wrap"><pre><code id="code-${s.id}">${esc(s.code)}</code></pre><button type="button" data-copy="code-${s.id}">Copy</button></div>
      <p class="sub">${esc(s.note)}${s.source ? ` Source: <a href="${esc(s.source.url)}" rel="noopener noreferrer">${esc(s.source.label)}</a>.` : ''}</p>
    </section>`,
    )
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MCP server · Mumcord crash reports</title>
  <link rel="stylesheet" href="/static/style.css">
</head>
<body>
  <header class="top">
    <h1><a href="/">Mumcord crash reports</a></h1>
  </header>
  <main class="help">
    <h2>MCP server</h2>
    <p>The service is a read-only <a href="https://modelcontextprotocol.io" rel="noopener noreferrer">MCP</a> server at
      <code>${esc(mcpUrl(origin))}</code>. An AI client (Claude Code, Claude Desktop, pi, …) can search and read the crash data
      with your personal API token. Nothing can be changed through it: no status changes, no issues, no deletes.</p>
    <h3>Tools</h3>
    <ul>
      <li><code>list_crash_groups</code>: filter by status, text, version, kind, component, last seen since; up to 100 groups.</li>
      <li><code>get_crash_group</code>: details, the AI analysis and the latest 10 reports (metadata only).</li>
      <li><code>get_crash_report</code>: one parsed report; raw text with <code>include_raw</code>, log lines and user note with <code>include_logs</code> (both off by default).</li>
      <li><code>crash_stats</code>: counts per day, top groups, per version, per OS and per component.</li>
    </ul>
    <h3>Create a token</h3>
    <p>Signed in, open <a href="/">People &amp; sign-in</a> &gt; API tokens, give the token a name (e.g. "Laptop – Claude Code")
      and pick an expiry (30 days, 90 days, 1 year or never). The token (<code>mcr_…</code>) is shown once, together with these
      blocks with the token filled in. Only its hash is stored. Tokens work only for <code>/mcp</code>, never for the admin page;
      revoke them there when a device is lost. Deleting a user or resetting their sign-in revokes their tokens.</p>
    <p class="sub">Anyone with the token can read all crash data, including log lines and raw reports when asked for. What
      your client reads goes to the model provider your client uses.</p>
    <h3>Connect a client</h3>
    <p>Replace <code>&lt;token&gt;</code> with your token.</p>
    ${blocks}
    <h3>Example prompts</h3>
    <ul>
      ${EXAMPLE_PROMPTS.map((p) => `<li>${esc(p)}</li>`).join('\n      ')}
    </ul>
  </main>
  <div id="toast" role="status"></div>
  <script src="/static/help.js"></script>
</body>
</html>
`;
}
