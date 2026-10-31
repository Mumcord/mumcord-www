// A tiny syntax highlighter for the site's code blocks: shell, YAML and .env. It runs at build time
// and in the configurator's script (no library, so the CSP stays strict). Output is escaped HTML
// with <span class="hl-…">; copy buttons read textContent, so copies stay plain text.

export type CodeLang = "shell" | "yaml" | "env" | "plain";

/** The language of a code block from its caption ("docker-compose.yml", ".env", "Terminal"). */
export function langOf(file?: string): CodeLang {
  if (!file || file === "Terminal") return "shell";
  if (/\.ya?ml$/.test(file)) return "yaml";
  if (file === ".env" || file.endsWith(".env")) return "env";
  return "plain";
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// One alternation per language; the group name is the CSS class. Comments start at "#" after a space.
const RULES: Record<Exclude<CodeLang, "plain">, RegExp> = {
  yaml: /(?<c>(?:^|(?<=\s))#.*$)|(?<s>"(?:[^"\\]|\\.)*"|'[^']*')|(?<v>\$\{[^}]*\})|(?<k>^\s*(?:-\s+)?[\w.-]+(?=:(?:\s|$)))|(?<n>(?<=:\s+)(?:true|false|\d+)\b)/g,
  shell:
    /(?<c>(?:^|(?<=\s))#.*$)|(?<s>"(?:[^"\\]|\\.)*"|'[^']*')|(?<v>\$\([^)]*\)|\$\{[^}]*\}|\$\w+)|(?<u>https?:\/\/[^\s'"]+)|(?<k>(?<=^\s*|(?:&&|\|\||\||;)\s*)[a-z][\w.-]*)|(?<f>(?<=\s)--?[\w-]+)/g,
  env: /(?<c>^\s*#.*$)|(?<k>^[A-Za-z_][\w]*(?==))|(?<v>\$\([^)]*\))/g,
};

function line(text: string, lang: Exclude<CodeLang, "plain">): string {
  const re = RULES[lang];
  re.lastIndex = 0;
  let out = "";
  let at = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m[0] === "") {
      re.lastIndex++;
      continue;
    }
    const cls = Object.entries(m.groups ?? {}).find(([, v]) => v !== undefined)?.[0];
    out += esc(text.slice(at, m.index)) + `<span class="hl-${cls}">${esc(m[0])}</span>`;
    at = m.index + m[0].length;
  }
  return out + esc(text.slice(at));
}

export function highlight(code: string, lang: CodeLang): string {
  if (lang === "plain") return esc(code);
  let heredoc: string | null = null;
  return code
    .split("\n")
    .map((l) => {
      // Lines of a here-document (cat > .env <<EOF … EOF) are file content, not commands.
      if (heredoc) {
        if (l.trim() === heredoc) {
          heredoc = null;
          return `<span class="hl-k">${esc(l)}</span>`;
        }
        return line(l, "env");
      }
      if (lang === "shell") heredoc = /<<-?\s*'?(\w+)'?\s*$/.exec(l)?.[1] ?? null;
      return line(l, lang);
    })
    .join("\n");
}
