/**
 * Sanitasi HTML ringan tanpa dependensi pihak ketiga — aman dipakai di server
 * maupun klien (murni manipulasi string, tanpa API DOM).
 *
 * Membuang vektor XSS umum: elemen script/style/iframe/svg/…, atribut event
 * (on*), serta URL berbahaya (javascript:, vbscript:, data: selain gambar).
 * Tag & atribut lain dibatasi ke daftar putih (allowlist).
 *
 * Dipakai oleh editor konten CMS (admin) dan saat render di web.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "strong", "b", "em", "i", "u", "s", "strike", "del", "ins", "mark", "small",
  "sub", "sup", "a", "img", "span", "div", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

/** Atribut yang diizinkan untuk semua tag. */
const GLOBAL_ATTRS = new Set(["id", "class", "style", "title"]);

/** Atribut khusus per tag. */
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height", "loading"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  td: new Set(["colspan", "rowspan"]),
  ol: new Set(["start", "type"]),
};

/** Elemen yang seluruh isinya dibuang (bukan hanya tag-nya). */
const DROP_WITH_CONTENT = [
  "script", "style", "iframe", "object", "embed", "form", "input", "textarea",
  "button", "select", "option", "optgroup", "label", "link", "meta", "base",
  "svg", "math", "noscript", "template", "head", "title", "frameset", "frame",
  "applet", "audio", "video", "source", "track", "canvas", "portal", "dialog",
];

/** Dekode entitas numerik/nama umum agar pemeriksaan skema URL tak bisa dikelabui. */
function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_, d: string) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&colon;/gi, ":")
    .replace(/&(tab|newline);/gi, "");
}

/** Kembalikan URL yang aman, atau null bila berbahaya. */
function safeUrl(raw: string): string | null {
  const value = raw.trim();
  const probe = decodeEntities(value).replace(/[\u0000-\u0020\u00a0]/g, "").toLowerCase();
  if (probe.startsWith("data:")) return /^data:image\//.test(probe) ? value : null;
  if (/^[a-z][a-z0-9+.-]*:/.test(probe) && !/^(https?|mailto|tel):/.test(probe)) return null;
  return value;
}

/** Saring atribut sebuah tag sesuai daftar putih. */
function scrubAttributes(raw: string, tag: string): string {
  const perTag = TAG_ATTRS[tag];
  const out: string[] = [];
  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(raw))) {
    const name = m[1].toLowerCase();
    if (name.startsWith("on") || name === "srcdoc" || name === "formaction") continue;
    if (!GLOBAL_ATTRS.has(name) && !(perTag ? perTag.has(name) : false)) continue;
    const value = (m[2] ?? m[3] ?? m[4] ?? "").trim();
    if (name === "href" || name === "src") {
      const safe = safeUrl(value);
      if (safe === null) continue;
      out.push(`${name}="${safe.replace(/"/g, "&quot;")}"`);
      continue;
    }
    if (name === "style") {
      if (/expression\(|javascript:/i.test(value)) continue;
      out.push(`style="${value.replace(/"/g, "&quot;")}"`);
      continue;
    }
    if (name === "target") {
      out.push('target="_blank"');
      continue;
    }
    out.push(value ? `${name}="${value.replace(/"/g, "&quot;")}"` : name);
  }
  // Tambahkan rel aman untuk tautan yang punya href
  if (tag === "a" && out.some((a) => a.startsWith("href=")) && !out.some((a) => a.startsWith("rel="))) {
    out.push('rel="noopener noreferrer"');
  }
  return out.length ? " " + out.join(" ") : "";
}

/** Sanitasi HTML dan kembalikan string yang aman untuk dirender. */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  let html = String(input);

  // 1) Buang komentar HTML
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  // 2) Buang elemen berbahaya beserta isinya, lalu sisa tag (self-closing/void)
  for (const tag of DROP_WITH_CONTENT) {
    html = html.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), "");
    html = html.replace(new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi"), "");
  }

  // 3) Saring tag & atribut
  html = html.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)\/?>/g,
    (_full, slash: string, nameRaw: string, attrRaw: string) => {
      const name = nameRaw.toLowerCase();
      if (!ALLOWED_TAGS.has(name)) return "";
      if (slash) return VOID_TAGS.has(name) ? "" : `</${name}>`;
      return `<${name}${scrubAttributes(attrRaw, name)}>`;
    },
  );

  return html;
}
