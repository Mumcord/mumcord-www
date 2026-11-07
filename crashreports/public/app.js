// Crash report admin UI. Plain JS, no framework. All server text goes through textContent.
'use strict';

const $ = (id) => document.getElementById(id);
const { startRegistration, startAuthentication } = window.SimpleWebAuthnBrowser;
const setupToken = location.pathname === '/setup' ? new URLSearchParams(location.search).get('token') : null;

let cfg = { ai: false, github: false, githubRepo: '' };
let selectedId = null;

// ---------- deep links: #/groups/<id> ----------
// The hash survives the passkey login (no navigation happens), so a link from the channel card
// opens its group right after signing in. Opening or closing a group updates the hash, so the
// back button works.

const GROUP_HASH = /^#\/groups\/([A-Za-z0-9_-]{1,128})$/;
const hashGroup = () => GROUP_HASH.exec(location.hash)?.[1] ?? null;
const groupHash = (id) => `#/groups/${encodeURIComponent(id)}`;

function setHash(hash) {
  if (location.hash === hash || (!hash && !location.hash)) return;
  if (hash) location.hash = hash;
  else history.pushState(null, '', location.pathname + location.search);
}

let routing = false;

/** Opens or closes the group the hash names; called after login and on back/forward. */
function route() {
  const id = hashGroup();
  if (id && id !== selectedId) selectGroup(id, false);
  else if (!id && selectedId) closeGroup(false);
}

function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: { 'x-crashreports-csrf': '1', ...(body !== undefined ? { 'content-type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path.startsWith('/api/admin')) {
    showAuth();
    throw new Error('Session expired, please sign in again');
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

let toastTimer;
function toast(msg, isError) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'show' + (isError ? ' err' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = ''), 4000);
}

const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString() : '');
function ago(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

// ---------- auth ----------

function showAuth() {
  $('app').hidden = true;
  $('nav').hidden = true;
  $('auth').hidden = false;
}

async function initAuth() {
  const state = await api('GET', '/api/auth/state');
  if (state.loggedIn) return showApp();
  showAuth();
  const btn = $('auth-btn');
  if (!state.hasCredentials) {
    if (!setupToken) {
      $('auth-title').textContent = 'Not set up yet';
      $('auth-text').textContent = 'Open /setup?token=… with the SETUP_TOKEN to register the first passkey.';
      btn.hidden = true;
      return;
    }
    $('auth-title').textContent = 'Set up';
    $('auth-text').textContent = 'Register the first admin passkey for this service.';
    btn.textContent = 'Register passkey';
    btn.onclick = () => register(true);
  } else {
    btn.onclick = login;
  }
}

async function register(first) {
  $('auth-error').textContent = '';
  try {
    const optionsJSON = await api('POST', '/api/auth/register/options', { setup_token: setupToken });
    const response = await startRegistration({ optionsJSON });
    const name = first ? 'first passkey' : (prompt('Name for this passkey (optional)') || '');
    await api('POST', '/api/auth/register/verify', { setup_token: setupToken, response, name });
    if (first) {
      history.replaceState(null, '', '/' + location.hash);
      showApp();
    } else {
      toast('Passkey added');
    }
  } catch (e) {
    if (first) $('auth-error').textContent = e.message;
    else toast(e.message, true);
  }
}

// ---------- invite: another person registers their own passkey ----------
// The token lives in the URL fragment (never sent to the server as part of the URL) and goes
// only into the request bodies.

const inviteToken = location.pathname === '/invite' ? location.hash.slice(1) : null;

function inviteFailed(msg, final) {
  $('invite-error').textContent = msg;
  if (final) {
    $('invite-form').hidden = true;
    $('invite-text').textContent = 'Ask an admin for a new invite link.';
  }
}

async function initInvite() {
  $('auth').hidden = true;
  $('invite').hidden = false;
  if (!inviteToken) return inviteFailed('This invite link is incomplete. Copy the whole link, including the part after #.', true);
  try {
    const info = await api('POST', '/api/auth/invite/info', { invite_token: inviteToken });
    if (info.label) $('invite-name').value = info.label;
  } catch (e) {
    return inviteFailed(e.message, true);
  }
  $('invite-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    $('invite-error').textContent = '';
    const btn = $('invite-btn');
    btn.disabled = true;
    try {
      const optionsJSON = await api('POST', '/api/auth/invite/register/options', { invite_token: inviteToken });
      const response = await startRegistration({ optionsJSON });
      await api('POST', '/api/auth/invite/register/verify', { invite_token: inviteToken, response, name: $('invite-name').value.trim() });
      location.replace('/');
    } catch (e) {
      const final = /expired|already been used|revoked|not valid/.test(e.message);
      inviteFailed(e.message, final);
      btn.disabled = false;
    }
  });
}

async function login() {
  $('auth-error').textContent = '';
  try {
    const optionsJSON = await api('POST', '/api/auth/login/options', {});
    const response = await startAuthentication({ optionsJSON });
    await api('POST', '/api/auth/login/verify', { response });
    showApp();
  } catch (e) {
    $('auth-error').textContent = e.message;
  }
}

// ---------- groups ----------

async function showApp() {
  $('auth').hidden = true;
  $('app').hidden = false;
  $('nav').hidden = false;
  cfg = await api('GET', '/api/admin/config');
  await loadGroups();
  route();
  if (!routing) window.addEventListener('hashchange', route);
  routing = true;
}

async function loadGroups() {
  const q = $('search').value.trim();
  const status = $('status-filter').value;
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  const groups = await api('GET', '/api/admin/groups?' + params);
  const tbody = $('groups');
  tbody.replaceChildren(
    ...groups.map((g) =>
      h('tr', { class: g.id === selectedId ? 'selected' : '', 'data-id': g.id, onclick: () => selectGroup(g.id) },
        h('td', {},
          h('span', { class: 'msg', title: g.message }, g.ai?.title || g.message),
          h('span', { class: 'sub' },
            h('span', { class: `badge ${g.status}` }, g.status),
            g.ai ? h('span', { class: `badge sev-${g.ai.severity}` }, g.ai.severity) : null,
            g.kind, g.weak ? ' · weak' : '', g.issue_url ? ' · issue' : ''),
        ),
        h('td', { class: 'num' }, g.count),
        h('td', { class: 'nowrap', title: fmtTime(g.last_seen) }, ago(g.last_seen)),
        h('td', {}, g.versions.slice(-3).join(', ')),
      ),
    ),
  );
  $('empty').hidden = groups.length > 0;
}

function markSelected() {
  for (const tr of $('groups').children) tr.classList.toggle('selected', tr.dataset.id === selectedId);
}

async function selectGroup(id, updateHash = true) {
  selectedId = id;
  if (updateHash) setHash(groupHash(id));
  markSelected();
  try {
    const { group, reports } = await api('GET', `/api/admin/groups/${encodeURIComponent(id)}`);
    if (selectedId !== id) return;
    renderDetail(group, reports);
  } catch (e) {
    if (selectedId !== id) return;
    $('detail').replaceChildren(h('p', { class: 'muted' }, `Crash group not found or not loaded: ${e.message}`));
  }
}

function closeGroup(updateHash = true, text = 'Select a crash group.') {
  selectedId = null;
  if (updateHash) setHash('');
  markSelected();
  $('detail').replaceChildren(h('p', { class: 'muted' }, text));
}

function aiBlock(g) {
  if (!cfg.ai && !g.ai) return null;
  const reanalyze = cfg.ai
    ? h('button', { class: 'ghost', onclick: (e) => analyze(g.id, e.target) }, g.ai ? 'Re-analyze' : 'Analyze')
    : null;
  if (g.ai_status === 'pending' && !g.ai) return h('div', { class: 'ai' }, h('p', { class: 'muted' }, 'AI analysis is running…'), reanalyze);
  if (!g.ai) {
    return h('div', { class: 'ai' },
      h('p', { class: g.ai_status === 'error' ? 'error' : 'muted' }, g.ai_status === 'error' ? `AI analysis failed: ${g.ai_error}` : 'No AI analysis yet.'),
      reanalyze);
  }
  const a = g.ai;
  const src = a.sources || [];
  return h('div', { class: 'ai' },
    h('p', {}, h('strong', {}, a.title)),
    h('p', {}, a.summary),
    h('p', {}, h('strong', {}, 'Likely cause: '), a.likely_cause),
    a.suspect_location ? h('p', {}, h('strong', {}, 'Suspect location: '), h('code', {}, a.suspect_location)) : null,
    a.fix_hint ? h('p', {}, h('strong', {}, 'Fix hint: '), a.fix_hint) : null,
    h('p', {},
      h('span', { class: `badge sev-${a.severity}` }, a.severity),
      h('span', { class: 'badge' }, a.component),
      ...a.suggested_labels.map((l) => h('span', { class: 'badge' }, l))),
    src.length
      ? h('p', { class: 'sub' }, 'Source sent along: ',
          ...src.flatMap((s, i) => [i ? ', ' : '',
            h('a', { href: `https://github.com/${cfg.githubRepo}/blob/${encodeURIComponent(s.ref)}/${s.path}#L${s.line}`, target: '_blank', rel: 'noopener' }, `${s.path}:${s.line}`)]))
      : null,
    g.ai_status === 'error' ? h('p', { class: 'error' }, `Last re-analysis failed: ${g.ai_error}`) : null,
    h('p', { class: 'sub' }, `Analyzed ${fmtTime(g.ai_at)} `, reanalyze),
  );
}

function kvList(title, map) {
  const entries = Object.entries(map || {});
  if (!entries.length) return null;
  return [h('h3', {}, title), h('dl', { class: 'meta' }, ...entries.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]))];
}

function renderDetail(g, reports) {
  const statusSel = h('select', { 'aria-label': 'Status', onchange: (e) => setStatus(g.id, e.target.value) },
    ...['new', 'triaged', 'fixed', 'ignored'].map((s) => h('option', { value: s, selected: s === g.status }, s)));
  const includePrivate = h('input', { type: 'checkbox', id: 'include-private' });
  const issue = g.issue_url
    ? h('a', { href: g.issue_url, target: '_blank', rel: 'noopener' }, 'GitHub issue ↗')
    : [
        h('button', { class: 'primary', disabled: !cfg.github, title: cfg.github ? '' : 'GITHUB_TOKEN is not set', onclick: (e) => createIssue(g.id, includePrivate.checked, e.target) }, 'Create GitHub issue'),
        h('label', { title: 'Adds the latest user note and log tail to the public issue' }, includePrivate, 'include user note + log tail'),
      ];

  $('detail').replaceChildren(...[
    h('h2', {}, g.ai?.title || g.message),
    h('div', { class: 'actions' }, statusSel, issue, h('button', { class: 'danger', onclick: () => deleteGroup(g.id) }, 'Delete group'),
      h('button', { class: 'ghost', title: 'Close this group', onclick: () => closeGroup() }, 'Close')),
    aiBlock(g),
    h('dl', { class: 'meta' },
      h('dt', {}, 'Kind'), h('dd', {}, g.kind),
      h('dt', {}, 'Count'), h('dd', {}, g.count),
      h('dt', {}, 'First seen'), h('dd', {}, fmtTime(g.first_seen)),
      h('dt', {}, 'Last seen'), h('dd', {}, fmtTime(g.last_seen)),
      h('dt', {}, 'Versions'), h('dd', {}, g.versions.join(', ')),
      h('dt', {}, 'OS'), h('dd', {}, g.os_list.join(', ')),
      h('dt', {}, 'Fingerprint'), h('dd', {}, h('code', {}, g.id.slice(0, 16))),
    ),
    h('h3', {}, 'Message'), h('pre', {}, g.message),
    h('h3', {}, g.weak ? 'Grouping (weak: no backtrace)' : 'Top app frames'), h('pre', {}, g.top_frames.join('\n') || '(none)'),
    h('h3', {}, `Latest reports (${reports.length})`),
    ...reports.map((r, i) =>
      h('details', { class: 'report', open: i === 0 },
        h('summary', {}, `${fmtTime(r.created_at)} · ${r.app_version} · ${r.os} ${r.os_version} · ${r.arch}`),
        h('dl', { class: 'meta' },
          h('dt', {}, 'Report'), h('dd', {}, h('code', {}, r.id)),
          h('dt', {}, 'Kind'), h('dd', {}, r.signal ? `${r.kind} ${r.signal}` : r.kind),
          r.thread ? [h('dt', {}, 'Thread'), h('dd', {}, r.thread)] : null,
          r.uptime ? [h('dt', {}, 'Uptime'), h('dd', {}, r.uptime)] : null,
          r.install_id ? [h('dt', {}, 'Install'), h('dd', {}, h('code', {}, r.install_id))] : null),
        kvList('Running', r.running),
        kvList('System', r.system),
        h('h3', {}, 'Message'), h('pre', {}, r.message),
        h('h3', {}, 'Backtrace'), h('pre', {}, r.backtrace || '(none)'),
        r.log_tail ? [h('h3', {}, 'Last log lines'), h('pre', {}, r.log_tail)] : null,
        r.user_note ? [h('h3', {}, 'User note'), h('pre', {}, r.user_note)] : null,
        r.raw ? h('details', { class: 'raw' }, h('summary', {}, 'Raw report'), h('pre', {}, r.raw)) : null,
        h('div', { class: 'actions' }, h('button', { class: 'danger', onclick: () => deleteReport(r.id, g.id) }, 'Delete report')),
      ),
    ),
  ].flat().filter(Boolean));
}

async function setStatus(id, status) {
  try {
    await api('PATCH', `/api/admin/groups/${encodeURIComponent(id)}`, { status });
    toast(`Status set to ${status}`);
    loadGroups();
  } catch (e) { toast(e.message, true); }
}

async function deleteGroup(id) {
  if (!confirm('Delete this crash group and all its reports?')) return;
  try {
    await api('DELETE', `/api/admin/groups/${encodeURIComponent(id)}`);
    closeGroup(true, 'Group deleted.');
    loadGroups();
  } catch (e) { toast(e.message, true); }
}

async function deleteReport(id, groupId) {
  if (!confirm('Delete this report?')) return;
  try {
    await api('DELETE', `/api/admin/reports/${encodeURIComponent(id)}`);
    selectGroup(groupId);
  } catch (e) { toast(e.message, true); }
}

async function createIssue(id, includePrivate, btn) {
  if (includePrivate && !confirm('The user note and log tail will be posted to a public issue. Continue?')) return;
  btn.disabled = true;
  try {
    const { url } = await api('POST', `/api/admin/groups/${encodeURIComponent(id)}/issue`, { include_private: includePrivate });
    toast('Issue created');
    await selectGroup(id);
    loadGroups();
    return url;
  } catch (e) { toast(e.message, true); btn.disabled = false; }
}

async function analyze(id, btn) {
  btn.disabled = true;
  btn.textContent = 'Analyzing…';
  try {
    await api('POST', `/api/admin/groups/${encodeURIComponent(id)}/analyze`, {});
    await selectGroup(id);
    loadGroups();
  } catch (e) { toast(e.message, true); btn.disabled = false; btn.textContent = 'Re-analyze'; }
}

// ---------- people & passkeys ----------

async function loadPeople() {
  const [creds, invites] = await Promise.all([api('GET', '/api/admin/credentials'), api('GET', '/api/admin/invites')]);
  $('passkeys').replaceChildren(
    ...creds.map((cr) =>
      h('tr', {},
        h('td', {}, cr.name || '(unnamed)', cr.current ? h('span', { class: 'badge new' }, 'you') : null),
        h('td', { class: 'nowrap', title: fmtTime(cr.created_at) }, ago(cr.created_at)),
        h('td', { class: 'nowrap', title: fmtTime(cr.last_used_at) }, cr.last_used_at ? ago(cr.last_used_at) : 'never'),
        h('td', {}, cr.invited_by || '—'),
        h('td', {}, h('button', { class: 'danger', disabled: creds.length <= 1, title: creds.length <= 1 ? 'The last passkey cannot be deleted' : '', onclick: () => deletePasskey(cr) }, 'Delete')),
      ),
    ),
  );
  const stateText = { open: 'open', used: 'used', expired: 'expired', revoked: 'revoked' };
  $('invites').replaceChildren(
    ...invites.map((i) =>
      h('tr', { class: i.state === 'open' ? '' : 'inactive' },
        h('td', {}, i.label || '(no label)', i.created_by ? h('span', { class: 'sub' }, ` · by ${i.created_by}`) : null),
        h('td', { class: 'nowrap', title: fmtTime(i.created_at) }, ago(i.created_at)),
        h('td', { class: 'nowrap' }, fmtTime(i.expires_at)),
        h('td', {}, stateText[i.state], i.state === 'used' && i.credential_name ? ` → ${i.credential_name}` : ''),
        h('td', {}, i.state === 'open' ? h('button', { class: 'danger', onclick: () => revokeInvite(i.id) }, 'Revoke') : null),
      ),
    ),
  );
  $('invites-empty').hidden = invites.length > 0;
}

async function togglePeople() {
  const show = $('people').hidden;
  $('people').hidden = !show;
  $('people-btn').setAttribute('aria-expanded', String(show));
  if (show) {
    $('invite-result').hidden = true;
    try { await loadPeople(); } catch (e) { toast(e.message, true); }
  }
}

async function createInvite(ev) {
  ev.preventDefault();
  try {
    const { url, expires_at } = await api('POST', '/api/admin/invites', {
      label: $('invite-label').value.trim(),
      ttl_hours: Number($('invite-ttl').value),
    });
    $('invite-link').value = url;
    $('invite-expires').textContent = fmtTime(expires_at);
    $('invite-result').hidden = false;
    $('invite-label').value = '';
    $('invite-link').select();
    loadPeople();
  } catch (e) { toast(e.message, true); }
}

async function copyInvite() {
  const input = $('invite-link');
  try {
    await navigator.clipboard.writeText(input.value);
    toast('Invite link copied');
  } catch {
    input.select();
    toast('Press Ctrl+C to copy the selected link');
  }
}

async function revokeInvite(id) {
  if (!confirm('Revoke this invite? The link stops working.')) return;
  try {
    await api('DELETE', `/api/admin/invites/${encodeURIComponent(id)}`);
    loadPeople();
  } catch (e) { toast(e.message, true); }
}

async function deletePasskey(cr) {
  const msg = cr.current
    ? 'This is the passkey you signed in with. Deleting it signs you out here. Continue?'
    : `Delete the passkey "${cr.name || '(unnamed)'}"? Its sessions end right away.`;
  if (!confirm(msg)) return;
  try {
    const r = await api('DELETE', `/api/admin/credentials/${encodeURIComponent(cr.id)}`);
    if (r.self) { location.href = '/'; return; }
    toast('Passkey deleted');
    loadPeople();
  } catch (e) { toast(e.message, true); }
}

// ---------- wiring ----------

let searchTimer;
$('search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadGroups, 250); });
$('status-filter').addEventListener('change', loadGroups);
$('refresh').addEventListener('click', () => { loadGroups(); if (selectedId) selectGroup(selectedId); });
$('add-passkey').addEventListener('click', async () => { await register(false); if (!$('people').hidden) loadPeople(); });
$('people-btn').addEventListener('click', togglePeople);
$('invite-create').addEventListener('submit', createInvite);
$('invite-copy').addEventListener('click', copyInvite);
$('logout').addEventListener('click', async () => {
  await api('POST', '/api/auth/logout', {}).catch(() => {});
  location.href = '/';
});

(inviteToken !== null ? initInvite() : initAuth()).catch((e) => toast(e.message, true));
