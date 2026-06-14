// Eksport do PDF bez żadnych zależności: renderujemy Markdown do HTML
// i otwieramy okno druku przeglądarki ("Zapisz jako PDF").
// W kolejnych etapach można podmienić to na generator z layoutami.

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

const PRINT_STYLES = `
  body { font-family: Georgia, 'Times New Roman', serif; color: #111; max-width: 720px; margin: 40px auto; line-height: 1.5; padding: 0 16px; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 16px; margin: 20px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; text-transform: uppercase; letter-spacing: .04em; }
  h3 { font-size: 14px; margin: 12px 0 4px; }
  p, li { font-size: 13px; }
  ul { margin: 4px 0 8px; padding-left: 20px; }
  @media print { body { margin: 0; } }
`

export function exportPdf(markdown: string): void {
  const html = mdToHtml(markdown)
  const win = window.open("", "_blank")
  if (!win) {
    alert("Pozwól na otwieranie okien (pop-up), aby wyeksportować PDF.")
    return
  }
  win.document.write(
    `<!doctype html><html lang="pl"><head><meta charset="utf-8" /><title>CV</title><style>${PRINT_STYLES}</style></head><body>${html}<script>window.onload=function(){window.print()}<\/script></body></html>`,
  )
  win.document.close()
}
