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

let authState = { hasCredentials: true, passwordLogin: false, user: null };

function showAuth() {
  $('app').hidden = true;
  $('nav').hidden = true;
  $('enroll').hidden = true;
  $('auth').hidden = false;
}

// ---------- password policy (the server runs the same checks) ----------

let policy = null;
async function loadPolicy() {
  policy ??= await api('GET', '/api/auth/policy');
  return policy;
}

/** The rules a password breaks, as the server checks them. */
function policyProblems(pw, username) {
  const bad = [];
  const n = [...pw].length;
  if (n < policy.min) bad.push('length');
  if (n > policy.max) bad.push('max');
  if (!/\p{Lu}/u.test(pw)) bad.push('upper');
  if (!/\p{Ll}/u.test(pw)) bad.push('lower');
  if (!/\p{Nd}/u.test(pw)) bad.push('digit');
  if (!/[^\p{L}\p{N}]/u.test(pw)) bad.push('special');
  const u = (username || '').trim().toLowerCase();
  if (u && pw.toLowerCase().includes(u)) bad.push('username');
  if (policy.common.includes(pw.toLowerCase())) bad.push('common');
  return bad;
}

/**
 * Live checklist under a password field. Returns check(): an error message, or '' when the
 * password passes and both fields match.
 */
function policyChecklist(ul, pwInput, repeatInput, getUsername) {
  const rules = ['length', 'upper', 'lower', 'digit', 'special', 'username', 'common'];
  const items = Object.fromEntries(rules.map((r) => [r, h('li', { 'data-rule': r }, policy.rules[r])]));
  const match = h('li', { 'data-rule': 'match' }, 'Both passwords match');
  ul.replaceChildren(...rules.map((r) => items[r]), match);
  let touched = false;
  const update = () => {
    const pw = pwInput.value;
    const bad = policyProblems(pw, getUsername());
    if (pw) touched = true;
    for (const r of rules) items[r].className = bad.includes(r) ? (touched ? 'bad' : '') : 'ok';
    if (bad.includes('max')) items.length.className = 'bad';
    const same = pw.length > 0 && pw === repeatInput.value;
    match.className = same ? 'ok' : repeatInput.value ? 'bad' : '';
    return { bad, same };
  };
  pwInput.addEventListener('input', update);
  repeatInput.addEventListener('input', update);
  update();
  return () => {
    touched = true;
    const { bad, same } = update();
    if (bad.length) return 'The password does not meet the rules: ' + bad.map((r) => (r === 'max' ? `at most ${policy.max} characters` : policy.rules[r].toLowerCase())).join(', ') + '.';
    if (!same) return 'The two passwords do not match.';
    return '';
  };
}

// ---------- TOTP enrollment and recovery codes ----------

/**
 * Shows the QR code and the secret, asks for the first code and calls finish(code), which
 * resolves to { recovery_codes } or throws. onRestart is called when the server dropped the
 * enrollment (expired, too many wrong codes).
 */
function totpPanel(container, enrollment, finish, onDone, onRestart) {
  const err = h('p', { class: 'error', role: 'alert' });
  const code = h('input', { id: 'totp-code', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6', required: true, 'aria-label': '6-digit code' });
  const btn = h('button', { class: 'primary', type: 'submit' }, 'Confirm');
  const form = h('form', { class: 'stack', onsubmit: async (ev) => {
    ev.preventDefault();
    err.textContent = '';
    btn.disabled = true;
    try {
      const r = await finish(code.value.replace(/\s/g, ''));
      recoveryPanel(container, r.recovery_codes, onDone);
    } catch (e) {
      err.textContent = e.message;
      code.value = '';
      code.focus();
      if (e.restart && onRestart) onRestart(e.message);
    } finally { btn.disabled = false; }
  } },
  h('label', { for: 'totp-code' }, 'Enter the 6-digit code the app shows'), code, btn);
  container.replaceChildren(h('div', { class: 'totp' },
    h('p', {}, 'Scan this QR code with your authenticator app (e.g. Aegis, Google Authenticator, 1Password, Bitwarden):'),
    h('img', { class: 'qr', src: enrollment.qr, alt: 'QR code for the authenticator app', width: '200', height: '200' }),
    h('p', { class: 'sub' }, 'Cannot scan? Enter this key manually (time-based, SHA-1, 6 digits, 30 s):'),
    h('code', { class: 'secret', id: 'totp-secret' }, enrollment.secret.replace(/(.{4})/g, '$1 ').trim()),
    form, err));
  code.focus();
}

function recoveryPanel(container, codes, onDone) {
  const download = () => {
    const text = 'Mumcord Crash Reports: recovery codes\n'
      + 'Each code works once, in place of the code from the authenticator app.\n\n'
      + codes.join('\n') + '\n';
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = h('a', { href: url, download: 'mumcord-crash-reports-recovery-codes.txt' });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  container.replaceChildren(h('div', { class: 'totp', id: 'recovery' },
    h('h3', {}, 'Recovery codes'),
    h('p', {}, 'Store these somewhere safe. Each one works once if you lose your authenticator app. They are shown only now.'),
    h('ol', { class: 'codes', id: 'recovery-codes' }, ...codes.map((c) => h('li', {}, c))),
    h('div', { class: 'actions' },
      h('button', { type: 'button', onclick: download }, 'Download as .txt'),
      h('button', { type: 'button', class: 'primary', id: 'recovery-done', onclick: onDone }, 'I saved them, continue'))));
}

/** api() that keeps the server's "restart" flag on the error. */
async function apiStep(method, path, body) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: { 'x-crashreports-csrf': '1', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(data.error || `HTTP ${res.status}`);
    e.restart = !!data.restart;
    e.status = res.status;
    throw e;
  }
  return data;
}

// ---------- sign in ----------

async function initAuth() {
  const state = await api('GET', '/api/auth/state');
  authState = state;
  if (state.loggedIn) return showApp();
  if (!state.hasCredentials) {
    if (setupToken) return initEnroll({ kind: 'setup' });
    showAuth();
    $('auth-title').textContent = 'Not set up yet';
    $('auth-text').textContent = 'Open /setup?token=… with the SETUP_TOKEN to create the first user.';
    $('login-box').hidden = true;
    return;
  }
  showAuth();
  $('auth-btn').onclick = login;
  $('pw-login').hidden = !state.passwordLogin;
  $('pw-off').hidden = state.passwordLogin;
}

let pendingLogin = null;

function resetPasswordLogin(msg) {
  pendingLogin = null;
  $('code-form').hidden = true;
  $('pw-form').hidden = false;
  $('auth-btn').hidden = false;
  $('pw-pass').value = '';
  $('auth-error').textContent = msg || '';
  if (msg) $('pw-pass').focus();
}

async function passwordLogin(ev) {
  ev.preventDefault();
  $('auth-error').textContent = '';
  try {
    const r = await apiStep('POST', '/api/auth/password/login', { username: $('pw-user').value.trim(), password: $('pw-pass').value });
    pendingLogin = r.pending;
    $('pw-form').hidden = true;
    $('auth-btn').hidden = true;
    $('code-form').hidden = false;
    $('code-input').value = '';
    $('code-input').focus();
  } catch (e) {
    $('auth-error').textContent = e.message;
  }
}

async function codeLogin(ev) {
  ev.preventDefault();
  $('auth-error').textContent = '';
  try {
    await apiStep('POST', '/api/auth/password/verify', { pending: pendingLogin, code: $('code-input').value.trim() });
    resetPasswordLogin();
    showApp();
  } catch (e) {
    if (e.restart) return resetPasswordLogin(e.message);
    $('auth-error').textContent = e.message;
    $('code-input').value = '';
    $('code-input').focus();
  }
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

// ---------- first setup and invites: passkey, or password + authenticator app ----------
// The invite token lives in the URL fragment (never sent to the server as part of the URL) and
// goes only into the request bodies.

const inviteToken = location.pathname === '/invite' ? location.hash.slice(1) : null;

function enrollFailed(msg, final) {
  $('enroll-error').textContent = msg;
  if (final) {
    $('enroll-form').hidden = true;
    $('enroll-totp').replaceChildren();
    $('enroll-text').textContent = 'Ask an admin for a new invite link.';
  }
}

const enrollMethod = () => document.querySelector('input[name="enroll-method"]:checked').value;

async function initEnroll({ kind }) {
  $('auth').hidden = true;
  $('enroll').hidden = false;
  const invite = kind === 'invite';
  $('enroll-title').textContent = invite ? "You're invited" : 'Set up';
  $('enroll-text').textContent = invite
    ? 'Choose a username and how you want to sign in to the crash report admin.'
    : 'Create the first admin user for this service.';
  if (invite && !inviteToken) return enrollFailed('This invite link is incomplete. Copy the whole link, including the part after #.', true);
  let state = authState;
  try {
    if (invite) {
      state = await api('GET', '/api/auth/state');
      const info = await api('POST', '/api/auth/invite/info', { invite_token: inviteToken });
      if (info.username) {
        // The invite restores sign-in for an existing user after a reset.
        $('enroll-user').value = info.username;
        $('enroll-user').readOnly = true;
        $('enroll-text').textContent = `Set up a new way to sign in for ${info.username}.`;
      } else if (info.label) {
        $('enroll-name').value = info.label;
      }
    }
    await loadPolicy();
  } catch (e) {
    return enrollFailed(e.message, invite);
  }
  if (!state.passwordLogin) {
    $('enroll-method-password').disabled = true;
    $('enroll-pw-off').hidden = false;
  }
  const check = policyChecklist($('enroll-policy'), $('enroll-pass'), $('enroll-pass2'), () => $('enroll-user').value);
  $('enroll-user').addEventListener('input', () => $('enroll-pass').dispatchEvent(new Event('input')));
  const syncMethod = () => {
    const pw = enrollMethod() === 'password';
    $('enroll-password').hidden = !pw;
    $('enroll-passkey').hidden = pw;
    $('enroll-btn').textContent = pw ? 'Continue' : 'Register passkey';
  };
  for (const r of document.querySelectorAll('input[name="enroll-method"]')) r.addEventListener('change', syncMethod);
  syncMethod();
  const tokenBody = invite ? { invite_token: inviteToken } : { setup_token: setupToken };
  const done = () => location.replace('/' + (invite ? '' : location.hash));

  $('enroll-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    $('enroll-error').textContent = '';
    const username = $('enroll-user').value.trim();
    if (!new RegExp(policy.username).test(username)) {
      $('enroll-error').textContent = 'Username: 2–40 characters, letters, digits and . _ - @, starting with a letter or digit.';
      return;
    }
    const btn = $('enroll-btn');
    if (enrollMethod() === 'password') {
      const problem = check();
      if (problem) { $('enroll-error').textContent = problem; return; }
      btn.disabled = true;
      try {
        const e = await apiStep('POST', '/api/auth/enroll/start', { ...tokenBody, username, password: $('enroll-pass').value });
        $('enroll-form').hidden = true;
        $('enroll-text').textContent = `Almost done, ${e.username}: connect your authenticator app.`;
        totpPanel($('enroll-totp'), e, (code) => apiStep('POST', '/api/auth/enroll/finish', { enroll_id: e.enroll_id, code }), done, (msg) => {
          $('enroll-totp').replaceChildren();
          $('enroll-form').hidden = false;
          enrollFailed(msg, /expired|already been used|revoked|not valid/.test(msg) && invite);
        });
      } catch (e) {
        enrollFailed(e.message, invite && /expired|already been used|revoked|not valid/.test(e.message));
      } finally { btn.disabled = false; }
      return;
    }
    btn.disabled = true;
    try {
      const base = invite ? '/api/auth/invite/register' : '/api/auth/register';
      const optionsJSON = await api('POST', `${base}/options`, { ...tokenBody, username });
      const response = await startRegistration({ optionsJSON });
      await api('POST', `${base}/verify`, { ...tokenBody, username, response, name: $('enroll-name').value.trim() });
      done();
    } catch (e) {
      enrollFailed(e.message, invite && /expired|already been used|revoked|not valid/.test(e.message));
    } finally { btn.disabled = false; }
  });
  $('enroll-user').focus();
}

/** Adds a passkey for the signed-in user. */
async function addPasskey() {
  try {
    const optionsJSON = await api('POST', '/api/auth/register/options', {});
    const response = await startRegistration({ optionsJSON });
    const name = prompt('Name for this passkey (optional)') || '';
    await api('POST', '/api/auth/register/verify', { response, name });
    toast('Passkey added');
  } catch (e) {
    toast(e.message, true);
  }
}

// ---------- groups ----------

async function showApp() {
  $('auth').hidden = true;
  $('enroll').hidden = true;
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

// ---------- people & sign-in ----------

function signInText(u) {
  const parts = [];
  if (u.passkeys.length) parts.push(`${u.passkeys.length} passkey${u.passkeys.length === 1 ? '' : 's'}`);
  if (u.password_2fa) parts.push(`password + 2FA (${u.recovery_codes_left} recovery code${u.recovery_codes_left === 1 ? '' : 's'} left)`);
  return parts.length ? parts.join(', ') : 'no sign-in: needs an invite link';
}

async function loadPeople() {
  const [users, creds, invites, me, tokens] = await Promise.all([
    api('GET', '/api/admin/users'),
    api('GET', '/api/admin/credentials'),
    api('GET', '/api/admin/invites'),
    api('GET', '/api/admin/account').catch(() => null),
    api('GET', '/api/admin/tokens').catch(() => null),
  ]);
  renderAccount(me);
  renderTokens(tokens);
  const canSignIn = users.filter((u) => u.passkeys.length || u.password_2fa);
  const isLast = (u) => canSignIn.length <= 1 && canSignIn[0]?.id === u.id;
  $('users').replaceChildren(
    ...users.map((u) =>
      h('tr', { 'data-user': u.username },
        h('td', {}, u.username, u.current ? h('span', { class: 'badge new' }, 'you') : null, u.locked ? h('span', { class: 'badge warn' }, 'locked') : null,
          u.display_name && u.display_name !== u.username ? h('div', { class: 'sub' }, u.display_name) : null),
        h('td', {}, signInText(u)),
        h('td', { class: 'nowrap', title: fmtTime(u.created_at) }, ago(u.created_at)),
        h('td', {}, u.invited_by || '—'),
        h('td', { class: 'nowrap' },
          !u.current && u.password_2fa
            ? h('button', { class: 'danger', disabled: isLast(u) && !u.passkeys.length, onclick: () => resetUserPassword(u) }, 'Reset password + 2FA')
            : null,
          !u.current && !u.passkeys.length && !u.password_2fa
            ? h('button', { onclick: () => inviteForUser(u) }, 'Create invite link')
            : null,
          ' ',
          h('button', { class: 'danger', disabled: isLast(u), title: isLast(u) ? 'The last user who can sign in cannot be deleted' : '', onclick: () => deleteUser(u) }, 'Delete user'),
        ),
      ),
    ),
  );
  const userName = Object.fromEntries(users.map((u) => [u.id, u.username]));
  const totalWays = creds.length + users.filter((u) => u.password_2fa).length;
  $('passkeys').replaceChildren(
    ...creds.map((cr) =>
      h('tr', {},
        h('td', {}, cr.name || '(unnamed)', cr.current ? h('span', { class: 'badge new' }, 'this session') : null),
        h('td', {}, userName[cr.user_id] || '—'),
        h('td', { class: 'nowrap', title: fmtTime(cr.created_at) }, ago(cr.created_at)),
        h('td', { class: 'nowrap', title: fmtTime(cr.last_used_at) }, cr.last_used_at ? ago(cr.last_used_at) : 'never'),
        h('td', {}, cr.invited_by || '—'),
        h('td', {}, h('button', { class: 'danger', disabled: totalWays <= 1, title: totalWays <= 1 ? 'The last way to sign in cannot be deleted' : '', onclick: () => deletePasskey(cr) }, 'Delete')),
      ),
    ),
  );
  const stateText = { open: 'open', used: 'used', expired: 'expired', revoked: 'revoked' };
  $('invites').replaceChildren(
    ...invites.map((i) =>
      h('tr', { class: i.state === 'open' ? '' : 'inactive' },
        h('td', {}, i.label || (i.for_user ? `for ${i.for_user}` : '(no label)'), i.created_by ? h('span', { class: 'sub' }, ` · by ${i.created_by}`) : null),
        h('td', { class: 'nowrap', title: fmtTime(i.created_at) }, ago(i.created_at)),
        h('td', { class: 'nowrap' }, fmtTime(i.expires_at)),
        h('td', {}, stateText[i.state], i.state === 'used' && i.credential_name ? ` → ${i.credential_name}` : ''),
        h('td', {}, i.state === 'open' ? h('button', { class: 'danger', onclick: () => revokeInvite(i.id) }, 'Revoke') : null),
      ),
    ),
  );
  $('invites-empty').hidden = invites.length > 0;
}

/** A small form inside the account box; fields: [id, label, type, autocomplete]. */
function miniForm(fields, submitText, onSubmit) {
  const inputs = {};
  const err = h('p', { class: 'error', role: 'alert' });
  const btn = h('button', { class: 'primary', type: 'submit' }, submitText);
  const form = h('form', { class: 'stack', onsubmit: async (ev) => {
    ev.preventDefault();
    err.textContent = '';
    btn.disabled = true;
    try { await onSubmit(inputs, err, form); } catch (e) { err.textContent = e.message; } finally { btn.disabled = false; }
  } },
  ...fields.flatMap(([id, label, type, ac]) => {
    inputs[id] = h('input', { id, type: type === 'password' ? 'password' : 'text', autocomplete: ac || 'off', maxlength: '1024' });
    return [h('label', { for: id }, label), inputs[id]];
  }));
  return { form, inputs, err, btn, append: (...els) => { form.append(...els); form.append(btn, err); } };
}

const CODE_LABEL = 'Code from your authenticator app (or a recovery code)';

function renderAccount(me) {
  const box = $('account');
  if (!me) {
    box.replaceChildren(h('p', { class: 'muted' }, 'This session belongs to no user (it is older than user accounts). Sign out and in again to manage your sign-in.'));
    return;
  }
  const status = h('p', {}, 'Signed in as ', h('strong', {}, me.username), '. ',
    `${me.passkeys} passkey${me.passkeys === 1 ? '' : 's'}; `,
    me.password_2fa ? `password + authenticator app set up, ${me.recovery_codes_left} recovery code${me.recovery_codes_left === 1 ? '' : 's'} left.` : 'no password set up.');
  const panel = h('div', { id: 'account-panel' });
  const items = [];
  const reload = () => loadPeople().catch((e) => toast(e.message, true));

  if (me.password_2fa) {
    // Change password: current password + code.
    const ch = miniForm([['acc-cur', 'Current password', 'password', 'current-password'], ['acc-code', CODE_LABEL, 'code', 'one-time-code'],
      ['acc-new', 'New password', 'password', 'new-password'], ['acc-new2', 'Repeat new password', 'password', 'new-password']], 'Change password',
    async (i, err) => {
      const problem = checkNew();
      if (problem) { err.textContent = problem; return; }
      const r = await api('POST', '/api/admin/account/password/change', { current_password: i['acc-cur'].value, code: i['acc-code'].value.trim(), new_password: i['acc-new'].value });
      toast(r.sessions_ended ? `Password changed; ${r.sessions_ended} other session(s) ended` : 'Password changed');
      reload();
    });
    const ul = h('ul', { class: 'policy' });
    ch.append(ul);
    const checkNew = policyChecklist(ul, ch.inputs['acc-new'], ch.inputs['acc-new2'], () => me.username);
    items.push(h('details', {}, h('summary', {}, 'Change password'), ch.form));

    const rc = miniForm([['acc-rc-code', CODE_LABEL, 'code', 'one-time-code']], 'New recovery codes', async (i) => {
      const r = await api('POST', '/api/admin/account/recovery-codes', { code: i['acc-rc-code'].value.trim() });
      recoveryPanel(panel, r.recovery_codes, () => { panel.replaceChildren(); reload(); });
    });
    rc.append(h('p', { class: 'sub' }, 'The old codes stop working.'));
    items.push(h('details', {}, h('summary', {}, 'Regenerate recovery codes'), rc.form));

    const rt = miniForm([['acc-rt-code', CODE_LABEL, 'code', 'one-time-code']], 'Reset authenticator app', async (i) => {
      const e = await api('POST', '/api/admin/account/totp/reset', { code: i['acc-rt-code'].value.trim() });
      totpPanel(panel, e, (code) => apiStep('POST', '/api/admin/account/enroll/finish', { enroll_id: e.enroll_id, code }),
        () => { panel.replaceChildren(); toast('Authenticator app replaced; your other sessions ended'); reload(); },
        (msg) => { panel.replaceChildren(h('p', { class: 'error' }, msg)); });
    });
    rt.append(h('p', { class: 'sub' }, 'Moves 2FA to a new app or phone. Your other sessions end.'));
    items.push(h('details', {}, h('summary', {}, 'Reset authenticator app'), rt.form));
  } else if (me.password_login) {
    const su = miniForm([['acc-pw', 'Password', 'password', 'new-password'], ['acc-pw2', 'Repeat password', 'password', 'new-password']], 'Continue',
      async (i, err) => {
        const problem = check();
        if (problem) { err.textContent = problem; return; }
        const e = await api('POST', '/api/admin/account/password/setup', { password: i['acc-pw'].value });
        totpPanel(panel, e, (code) => apiStep('POST', '/api/admin/account/enroll/finish', { enroll_id: e.enroll_id, code }),
          () => { panel.replaceChildren(); toast('Password + authenticator app set up'); reload(); },
          (msg) => { panel.replaceChildren(h('p', { class: 'error' }, msg)); });
      });
    const ul = h('ul', { class: 'policy' });
    su.append(ul);
    const check = policyChecklist(ul, su.inputs['acc-pw'], su.inputs['acc-pw2'], () => me.username);
    items.push(h('details', {}, h('summary', {}, 'Set up password + authenticator app'), su.form));
  } else {
    items.push(h('p', { class: 'sub' }, 'Password sign-in is off on this server (no TOTP_ENCRYPTION_KEY).'));
  }
  items.push(h('div', { class: 'actions' }, h('button', { class: 'ghost', onclick: async () => { await addPasskey(); reload(); } }, 'Add a passkey for myself')));
  box.replaceChildren(h('div', { class: 'account-box' }, status, ...items, panel));
}

async function togglePeople() {
  const show = $('people').hidden;
  $('people').hidden = !show;
  $('people-btn').setAttribute('aria-expanded', String(show));
  if (show) {
    $('invite-result').hidden = true;
    hideToken();
    try { await loadPolicy(); await loadPeople(); } catch (e) { toast(e.message, true); }
  }
}

function showInvite({ url, expires_at }) {
  $('invite-link').value = url;
  $('invite-expires').textContent = fmtTime(expires_at);
  $('invite-result').hidden = false;
  $('invite-link').select();
}

async function createInvite(ev) {
  ev.preventDefault();
  try {
    showInvite(await api('POST', '/api/admin/invites', {
      label: $('invite-label').value.trim(),
      ttl_hours: Number($('invite-ttl').value),
    }));
    $('invite-label').value = '';
    loadPeople();
  } catch (e) { toast(e.message, true); }
}

async function inviteForUser(u) {
  try {
    showInvite(await api('POST', '/api/admin/invites', { user_id: u.id, ttl_hours: Number($('invite-ttl').value) }));
    toast(`Invite link for ${u.username} created`);
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

async function deleteUser(u) {
  const msg = u.current
    ? 'Delete your own user? You are signed out right away.'
    : `Delete the user "${u.username}" with all their passkeys and their password? Their sessions end right away.`;
  if (!confirm(msg)) return;
  try {
    const r = await api('DELETE', `/api/admin/users/${encodeURIComponent(u.id)}`);
    if (r.self) { location.href = '/'; return; }
    toast('User deleted');
    loadPeople();
  } catch (e) { toast(e.message, true); }
}

async function resetUserPassword(u) {
  if (!confirm(`Reset the password and authenticator app of "${u.username}"? Their sessions end right away.`)) return;
  try {
    const r = await api('POST', `/api/admin/users/${encodeURIComponent(u.id)}/reset-password`, {});
    if (r.needs_invite && confirm(`${u.username} has no other way to sign in. Create an invite link for them now?`)) await inviteForUser(u);
    else toast('Password + 2FA reset');
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

// ---------- API tokens (MCP) ----------

function renderTokens(data) {
  const list = data ? data.tokens : [];
  if (data) $('mcp-url').textContent = data.mcp_url;
  $('tokens').replaceChildren(
    ...list.map((t) =>
      h('tr', {},
        h('td', {}, t.name),
        h('td', {}, h('code', {}, `${t.prefix}…`)),
        h('td', { class: 'nowrap', title: fmtTime(t.created_at) }, ago(t.created_at)),
        h('td', { class: 'nowrap', title: fmtTime(t.last_used_at) }, t.last_used_at ? ago(t.last_used_at) : 'never'),
        h('td', { class: 'nowrap' }, t.expires_at ? fmtTime(t.expires_at) : 'never'),
        h('td', {}, h('button', { class: 'danger', onclick: () => revokeToken(t) }, 'Revoke')),
      ),
    ),
  );
  $('tokens-empty').hidden = list.length > 0;
}

async function copyText(text, what) {
  try {
    await navigator.clipboard.writeText(text);
    toast(`${what} copied`);
  } catch {
    toast('Copying failed; select the text and press Ctrl+C', true);
  }
}

/** The one-time panel: the token and the client setup blocks with the token filled in. */
function showToken(r) {
  $('token-value').value = r.token;
  $('token-setups').replaceChildren(
    ...r.setups.map((s) =>
      h('div', { class: 'help-block' },
        h('h4', {}, s.title),
        h('p', { class: 'sub' }, s.intro),
        h('div', { class: 'code-wrap' },
          h('pre', {}, h('code', {}, s.code)),
          h('button', { type: 'button', onclick: () => copyText(s.code, s.title) }, 'Copy'),
        ),
        h('p', { class: 'sub' }, s.note),
      ),
    ),
  );
  $('token-result').hidden = false;
  $('token-value').select();
}

function hideToken() {
  $('token-value').value = '';
  $('token-setups').replaceChildren();
  $('token-result').hidden = true;
}

async function createToken(ev) {
  ev.preventDefault();
  const name = $('token-name').value.trim();
  if (!name) return toast('Give the token a name', true);
  const days = $('token-days').value;
  try {
    showToken(await api('POST', '/api/admin/tokens', { name, expires_in_days: days === 'never' ? null : Number(days) }));
    $('token-name').value = '';
    loadPeople();
  } catch (e) { toast(e.message, true); }
}

async function revokeToken(t) {
  if (!confirm(`Revoke the API token "${t.name}"? Clients using it lose access right away.`)) return;
  try {
    await api('DELETE', `/api/admin/tokens/${encodeURIComponent(t.id)}`);
    toast('Token revoked');
    loadPeople();
  } catch (e) { toast(e.message, true); }
}

// ---------- wiring ----------

let searchTimer;
$('search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadGroups, 250); });
$('status-filter').addEventListener('change', loadGroups);
$('refresh').addEventListener('click', () => { loadGroups(); if (selectedId) selectGroup(selectedId); });
$('people-btn').addEventListener('click', togglePeople);
$('invite-create').addEventListener('submit', createInvite);
$('invite-copy').addEventListener('click', copyInvite);
$('token-create').addEventListener('submit', createToken);
$('token-copy').addEventListener('click', () => copyText($('token-value').value, 'Token'));
$('token-done').addEventListener('click', hideToken);
$('pw-form').addEventListener('submit', passwordLogin);
$('code-form').addEventListener('submit', codeLogin);
$('code-cancel').addEventListener('click', () => resetPasswordLogin());
$('logout').addEventListener('click', async () => {
  await api('POST', '/api/auth/logout', {}).catch(() => {});
  location.href = '/';
});

(inviteToken !== null ? initEnroll({ kind: 'invite' }) : initAuth()).catch((e) => toast(e.message, true));
