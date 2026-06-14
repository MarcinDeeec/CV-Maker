// Eksport do PDF bez żadnych zależności: renderujemy Markdown do HTML
// i otwieramy okno druku przeglądarki ("Zapisz jako PDF").
// Od v0.5: kilka layoutów do wyboru.

export type PdfLayout = "classic" | "compact" | "modern"

export const PDF_LAYOUTS: { id: PdfLayout; label: string }[] = [
  { id: "classic", label: "Klasyczny (serif)" },
  { id: "compact", label: "Kompaktowy" },
  { id: "modern", label: "Nowoczesny (akcent)" },
]

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
}

/** Minimalny konwerter Markdown -> HTML (nagłówki, listy, pogrubienia, akapity). */
export function mdToHtml(md: string): string {
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let inList = false
  const closeList = () => {
    if (inList) {
      out.push("</ul>")
      inList = false
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      closeList()
      continue
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    if (heading) {
      closeList()
      const lvl = heading[1].length
      out.push(`<h${lvl}>${inline(heading[2])}</h${lvl}>`)
      continue
    }
    const bullet = line.match(/^[-*]\s+(.*)$/)
    if (bullet) {
      if (!inList) {
        out.push("<ul>")
        inList = true
      }
      out.push(`<li>${inline(bullet[1])}</li>`)
      continue
    }
    closeList()
    out.push(`<p>${inline(line)}</p>`)
  }
  closeList()
  return out.join("\n")
}

const LAYOUT_STYLES: Record<PdfLayout, string> = {
  classic: `
    body { font-family: Georgia, 'Times New Roman', serif; color: #111; max-width: 720px; margin: 40px auto; line-height: 1.5; padding: 0 16px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    h2 { font-size: 16px; margin: 20px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; text-transform: uppercase; letter-spacing: .04em; }
    h3 { font-size: 14px; margin: 12px 0 4px; }
    p, li { font-size: 13px; }
    ul { margin: 4px 0 8px; padding-left: 20px; }
    @media print { body { margin: 0; } }
  `,
  compact: `
    body { font-family: 'Liberation Sans', Arial, sans-serif; color: #1a1a1a; max-width: 760px; margin: 24px auto; line-height: 1.35; padding: 0 14px; }
    h1 { font-size: 20px; margin: 0 0 2px; }
    h2 { font-size: 13px; margin: 12px 0 4px; text-transform: uppercase; letter-spacing: .03em; color: #333; }
    h3 { font-size: 12px; margin: 8px 0 2px; }
    p, li { font-size: 11.5px; }
    ul { margin: 2px 0 6px; padding-left: 18px; }
    @media print { body { margin: 0; } }
  `,
  modern: `
    body { font-family: 'Liberation Sans', Arial, sans-serif; color: #222; max-width: 740px; margin: 36px auto; line-height: 1.5; padding: 0 18px; }
    h1 { font-size: 26px; margin: 0 0 4px; color: #1f6feb; }
    h2 { font-size: 15px; margin: 18px 0 6px; color: #1f6feb; border-left: 4px solid #1f6feb; padding-left: 8px; }
    h3 { font-size: 13px; margin: 10px 0 3px; color: #444; }
    p, li { font-size: 13px; }
    ul { margin: 4px 0 8px; padding-left: 20px; }
    @media print { body { margin: 0; } }
  `,
}

export function exportPdf(markdown: string, layout: PdfLayout = "classic"): void {
  const html = mdToHtml(markdown)
  const win = window.open("", "_blank")
  if (!win) {
    alert("Pozwól na otwieranie okien (pop-up), aby wyeksportować PDF.")
    return
  }
  const styles = LAYOUT_STYLES[layout] ?? LAYOUT_STYLES.classic
  win.document.write(
    `<!doctype html><html lang="pl"><head><meta charset="utf-8" /><title>CV</title><style>${styles}</style></head><body>${html}<script>window.onload=function(){window.print()}<\/script></body></html>`,
  )
  win.document.close()
}
