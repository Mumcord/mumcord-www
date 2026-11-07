import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { STATUSES, type GroupRow, type ReportRow, type Store } from './db.ts';
import { redactHome } from './fingerprint.ts';

/**
 * Read-only MCP server over the crash data. Stateless Streamable HTTP: every POST gets its own
 * server and transport, so nothing is kept between requests. There are no write tools.
 */

export interface McpOptions {
  store: Store;
  /** Public origin, for links to the admin page. */
  origin: string;
  version: string;
  now?: () => number;
}

const json = (data: unknown): CallToolResult => ({ content: [{ type: 'text', text: JSON.stringify(data) }] });
const fail = (message: string): CallToolResult => ({ isError: true, content: [{ type: 'text', text: message }] });
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

const titleOf = (g: GroupRow): string => g.ai?.title || redactHome(g.message);

function groupSummary(g: GroupRow, origin: string) {
  return {
    id: g.id,
    title: titleOf(g),
    kind: g.kind,
    status: g.status,
    severity: g.ai?.severity ?? null,
    component: g.ai?.component || null,
    count: g.count,
    first_seen: g.first_seen,
    last_seen: g.last_seen,
    versions: g.versions,
    issue_url: g.issue_url,
    url: `${origin}/#/groups/${encodeURIComponent(g.id)}`,
  };
}

function reportMeta(r: ReportRow) {
  return {
    id: r.id,
    created_at: r.created_at,
    app_version: r.app_version,
    os: r.os,
    os_version: r.os_version,
    arch: r.arch,
    kind: r.kind,
    signal: r.signal,
    thread: r.thread,
    uptime: r.uptime,
  };
}

export function buildMcpServer(opts: McpOptions): McpServer {
  const { store, origin } = opts;
  const now = opts.now ?? Date.now;
  const server = new McpServer(
    { name: 'mumcord-crashes', version: opts.version },
    {
      instructions:
        'Read-only access to Mumcord crash reports. Crashes are grouped by fingerprint; start with list_crash_groups or crash_stats, ' +
        'then get_crash_group for details and get_crash_report for one report. Reports are kept 90 days and at most 50 per group, ' +
        'so counts from reports can be lower than the group total.',
    },
  );

  server.registerTool(
    'list_crash_groups',
    {
      title: 'List crash groups',
      description:
        'Lists crash groups (crashes with the same fingerprint), most recently seen first. Each entry has id, title (AI title or the ' +
        'crash cause), kind, status, AI severity and component, total count, first/last seen, the app versions it was seen in, ' +
        'the GitHub issue URL and a link to the admin page. All filters are optional and combined with AND.',
      inputSchema: {
        status: z.enum(STATUSES).optional().describe('Triage status: new, triaged, fixed or ignored'),
        query: z.string().max(200).optional().describe('Text search in the cause, top frames, AI analysis and group id'),
        version: z.string().max(60).optional().describe('Only groups seen in this exact app version, e.g. "0.7.1"'),
        kind: z.string().max(40).optional().describe('"panic", "signal", or a full kind such as "signal SIGSEGV"'),
        component: z.string().max(80).optional().describe('AI component, e.g. "audio" (case-insensitive)'),
        since: z.iso.datetime({ offset: true }).or(z.iso.date()).optional().describe('ISO date or date-time; only groups last seen at or after it'),
        limit: z.number().int().min(1).max(100).default(25).describe('Maximum number of groups (1-100, default 25)'),
      },
      annotations: { title: 'List crash groups', ...READ_ONLY },
    },
    async (a) => {
      const since = a.since ? new Date(a.since).toISOString() : undefined;
      const groups = store.searchGroups({ status: a.status, q: a.query, version: a.version, kind: a.kind, component: a.component, since, limit: a.limit });
      return json({ count: groups.length, groups: groups.map((g) => groupSummary(g, origin)) });
    },
  );

  server.registerTool(
    'get_crash_group',
    {
      title: 'Get crash group',
      description:
        'One crash group by id: kind, cause, top app frames, versions, OS list, status, counts, issue URL, the AI analysis ' +
        '(summary, likely cause, suspect location, fix hint, labels) if there is one, and the metadata of the latest 10 reports ' +
        '(no raw text or logs; use get_crash_report for one report).',
      inputSchema: { id: z.string().min(1).max(128).describe('Group id (the sha256 fingerprint from list_crash_groups)') },
      annotations: { title: 'Get crash group', ...READ_ONLY },
    },
    async ({ id }) => {
      const g = store.getGroup(id);
      if (!g) return fail(`No crash group with id ${id}`);
      const ai = g.ai
        ? {
            title: g.ai.title,
            summary: g.ai.summary,
            likely_cause: g.ai.likely_cause,
            suspect_location: g.ai.suspect_location,
            fix_hint: g.ai.fix_hint,
            severity: g.ai.severity,
            component: g.ai.component,
            labels: g.ai.suggested_labels,
            analyzed_at: g.ai_at,
          }
        : null;
      return json({
        ...groupSummary(g, origin),
        cause: redactHome(g.message),
        top_frames: g.top_frames,
        os_list: g.os_list,
        weak_fingerprint: g.weak,
        ai_status: g.ai_status,
        ai,
        latest_reports: store.latestReports(g.id, 10).map(reportMeta),
      });
    },
  );

  server.registerTool(
    'get_crash_report',
    {
      title: 'Get crash report',
      description:
        'One crash report by id, parsed: version, OS, arch, kind, thread, cause, uptime, what was running, system details and the ' +
        'backtrace. The raw uploaded text is included only with include_raw=true; the last log lines and the user note only with ' +
        'include_logs=true.',
      inputSchema: {
        id: z.string().min(1).max(128).describe('Report id (from get_crash_group latest_reports)'),
        include_raw: z.boolean().default(false).describe('Also return the raw crash file text (default false)'),
        include_logs: z.boolean().default(false).describe('Also return the last log lines and the user note (default false)'),
      },
      annotations: { title: 'Get crash report', ...READ_ONLY },
    },
    async ({ id, include_raw, include_logs }) => {
      const r = store.getReport(id);
      if (!r) return fail(`No crash report with id ${id} (reports are deleted after 90 days)`);
      return json({
        ...reportMeta(r),
        group_id: r.group_id,
        crash_time: r.crash_time,
        cause: redactHome(r.message),
        running: r.running,
        system: r.system,
        backtrace: r.backtrace,
        ...(include_logs ? { log_tail: r.log_tail, user_note: r.user_note } : {}),
        ...(include_raw ? { raw: r.raw } : {}),
      });
    },
  );

  server.registerTool(
    'crash_stats',
    {
      title: 'Crash statistics',
      description:
        'Report counts over the last N days: total, per day (UTC), top 10 groups, per app version, per OS and per AI component. ' +
        'Counts only stored reports (kept 90 days, at most 50 per group).',
      inputSchema: { days: z.number().int().min(1).max(365).default(30).describe('Window in days (1-365, default 30)') },
      annotations: { title: 'Crash statistics', ...READ_ONLY },
    },
    async ({ days }) => json(store.crashStats(days, new Date(now()))),
  );

  return server;
}

/** Handles one POST /mcp request (stateless, JSON responses). */
export async function handleMcpRequest(req: Request, opts: McpOptions): Promise<Response> {
  const server = buildMcpServer(opts);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  try {
    await server.connect(transport);
    return await transport.handleRequest(req);
  } finally {
    // JSON mode: the response is complete here, so the per-request server can go.
    await server.close().catch(() => {});
  }
}
