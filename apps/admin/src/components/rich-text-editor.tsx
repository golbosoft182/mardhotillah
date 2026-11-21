"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bold, Code2, Eraser, Heading2, Heading3, Italic, Link2, List, ListOrdered,
  Minus, Quote, Redo2, Strikethrough, Underline, Undo2, Unlink,
} from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize-html";

/**
 * Editor konten HTML (WYSIWYG) tanpa dependensi pihak ketiga.
 * Memakai contentEditable + perintah bawaan browser, dengan sanitasi
 * otomatis (cek-saat-tempel, saat blur, dan mode HTML) agar HTML yang
 * tersimpan aman. Tersedia tombol beralih ke mode HTML sumber.
 */

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** kelas tinggi minimum area editor (default min-h-[320px]) */
  minHeightClass?: string;
}

const btnCls =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-brand-100 hover:text-brand-700";

function ToolbarButton({
  onClick, title, active, children,
}: { onClick: () => void; title: string; active?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      // pertahankan seleksi teks di editor saat tombol ditekan
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`${btnCls} ${active ? "bg-brand-500 text-white hover:bg-brand-500 hover:text-white" : ""}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder = "Tulis konten di sini…", minHeightClass = "min-h-[320px]" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [source, setSource] = useState(value ?? "");

  // Sinkronkan nilai eksternal → DOM hanya saat editor tidak sedang difokus,
  // agar posisi kursor tidak melompat. Konten disanitasi sebelum ditempel ke DOM.
  useEffect(() => {
    if (mode !== "visual") return;
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    const next = sanitizeHtml(value ?? "");
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value, mode]);

  useEffect(() => { setSource(value ?? ""); }, [value]);

  function emit() {
    const el = ref.current;
    if (el) onChange(el.innerHTML);
  }

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  function formatBlock(tag: "h2" | "h3" | "blockquote" | "p") {
    exec("formatBlock", `<${tag}>`);
  }

  function addLink() {
    const selected = window.getSelection()?.toString() ?? "";
    const url = window.prompt("URL tautan (https://…):", "https://");
    if (!url) return;
    const trimmed = url.trim();
    if (!/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) {
      window.alert("Hanya tautan http(s), mailto, tel, atau relatif yang diizinkan.");
      return;
    }
    if (selected) {
      exec("createLink", trimmed);
    } else {
      const label = trimmed.replace(/^https?:\/\//, "");
      ref.current?.focus();
      document.execCommand("insertHTML", false, sanitizeHtml(`<a href="${trimmed}">${label}</a>`));
      emit();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const htmlData = e.clipboardData.getData("text/html");
    const textData = e.clipboardData.getData("text/plain");
    e.preventDefault();
    if (htmlData) {
      document.execCommand("insertHTML", false, sanitizeHtml(htmlData));
    } else {
      document.execCommand("insertText", false, textData);
    }
    emit();
  }

  function handleBlur() {
    if (mode !== "visual") return;
    const el = ref.current;
    if (!el) return;
    const clean = sanitizeHtml(el.innerHTML);
    if (clean !== el.innerHTML) {
      el.innerHTML = clean;
      onChange(clean);
    }
  }

  function toggleMode() {
    if (mode === "visual") {
      setSource(ref.current?.innerHTML ?? value ?? "");
      setMode("html");
    } else {
      const clean = sanitizeHtml(source);
      onChange(clean);
      setSource(clean);
      setMode("visual"); // DOM disinkronkan oleh useEffect(value, mode)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-brand-200 bg-white transition focus-within:border-brand-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-brand-100 bg-cream/60 px-2 py-1.5">
        <ToolbarButton title="Tebal" onClick={() => exec("bold")}><Bold className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Miring" onClick={() => exec("italic")}><Italic className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Garis bawah" onClick={() => exec("underline")}><Underline className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Coret" onClick={() => exec("strikeThrough")}><Strikethrough className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-brand-100" aria-hidden />
        <ToolbarButton title="Judul (H2)" onClick={() => formatBlock("h2")}><Heading2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Subjudul (H3)" onClick={() => formatBlock("h3")}><Heading3 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Kutipan" onClick={() => formatBlock("blockquote")}><Quote className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-brand-100" aria-hidden />
        <ToolbarButton title="Daftar berpoin" onClick={() => exec("insertUnorderedList")}><List className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Daftar bernomor" onClick={() => exec("insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-brand-100" aria-hidden />
        <ToolbarButton title="Tautan" onClick={addLink}><Link2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Hapus tautan" onClick={() => exec("unlink")}><Unlink className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Garis pemisah" onClick={() => exec("insertHorizontalRule")}><Minus className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-brand-100" aria-hidden />
        <ToolbarButton title="Urungkan" onClick={() => exec("undo")}><Undo2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Ulangi" onClick={() => exec("redo")}><Redo2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton title="Bersihkan format" onClick={() => { exec("removeFormat"); exec("formatBlock", "<p>"); }}>
          <Eraser className="h-4 w-4" />
        </ToolbarButton>
        <span className="ml-auto" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleMode}
          title={mode === "visual" ? "Lihat/edit HTML sumber" : "Kembali ke tampilan visual"}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition ${
            mode === "html" ? "bg-brand-500 text-white" : "text-ink-soft hover:bg-brand-100 hover:text-brand-700"
          }`}
        >
          <Code2 className="h-4 w-4" aria-hidden /> {mode === "visual" ? "HTML" : "Visual"}
        </button>
      </div>

      {/* Area edit */}
      {mode === "visual" ? (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Konten"
          onInput={emit}
          onBlur={handleBlur}
          onPaste={handlePaste}
          data-placeholder={placeholder}
          className={`cms-editor max-w-none px-4 py-3 text-sm text-ink outline-none ${minHeightClass}`}
        />
      ) : (
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
          aria-label="HTML sumber"
          className={`w-full resize-y px-4 py-3 font-mono text-[13px] leading-relaxed text-ink outline-none ${minHeightClass}`}
        />
      )}
    </div>
  );
}
