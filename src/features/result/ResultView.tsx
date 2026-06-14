import { useState } from "react"
import { useProject } from "@/state/useProject"
import { downloadMarkdown } from "@/lib/export/markdown"
import { exportPdf, PDF_LAYOUTS, type PdfLayout } from "@/lib/export/pdf"

export function ResultView() {
  const {
    tailored,
    setTailoredMarkdown,
    toggleSuggestion,
    error,
    setStep,
    generating,
    versions,
    saveCurrentVersion,
    loadVersionIntoEditor,
    deleteVersion,
  } = useProject()
  const [openEvidence, setOpenEvidence] = useState<string | null>(null)
  const [versionName, setVersionName] = useState("")
  const [pdfLayout, setPdfLayout] = useState<PdfLayout>("classic")

  if (!tailored) {
    return (
      <section className="view">
        <h2>Dopasowane CV</h2>
        <p className="muted">Najpierw wygeneruj CV w kroku analizy.</p>
        <button className="btn" onClick={() => setStep("analysis")}>
          Przejdź do analizy
        </button>
      </section>
    )
  }

  const aiLocked = tailored.aiGenerated === true

  return (
    <section className="view">
      <h2>Dopasowane CV</h2>
      {error && <div className="alert">{error}</div>}

      <div className="grid-2">
        <div className="field">
          <div className="field__head">
            <label>Podgląd (możesz edytować ręcznie)</label>
          </div>
          <textarea
            value={tailored.markdown}
            onChange={(e) => setTailoredMarkdown(e.target.value)}
            rows={24}
          />
        </div>

        <div className="panel">
          <h3>Sugestie · review-first</h3>
          {aiLocked && (
            <p className="muted small">
              Treść pochodzi z modelu AI — przełączniki są nieaktywne. Edytuj tekst ręcznie po lewej.
            </p>
          )}
          <ul className="suggestions">
            {tailored.suggestions.map((s) => (
              <li key={s.id} className="suggestion">
                <label className="suggestion__row">
                  <input
                    type="checkbox"
                    checked={s.accepted}
                    disabled={aiLocked}
                    onChange={() => toggleSuggestion(s.id)}
                  />
                  <span>
                    <span className={`tag tag--${s.source}`}>{s.source}</span>
                    <strong>{s.title}</strong>
                    <span className="muted small block">{s.detail}</span>
                  </span>
                </label>
                {s.evidence && (
                  <div className="suggestion__evidence">
                    <button
                      className="link"
                      onClick={() => setOpenEvidence(openEvidence === s.id ? null : s.id)}
                    >
                      {openEvidence === s.id
                        ? "Ukryj źródło"
                        : `Pokaż źródło (${s.evidence.origin === "cv" ? "z CV" : "z oferty"})`}
                    </button>
                    {openEvidence === s.id && (
                      <blockquote className="evidence">
                        <span className="muted small">{s.evidence.label}</span>
                        <br />
                        {s.evidence.excerpt}
                      </blockquote>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel">
        <h3>Zapisane wersje ({versions.length})</h3>
        <div className="version-save">
          <input
            placeholder="Nazwa wersji (np. Frontend React)"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
          />
          <button
            className="btn btn--sm"
            onClick={() => {
              saveCurrentVersion(versionName.trim() || undefined)
              setVersionName("")
            }}
          >
            Zapisz wersję
          </button>
        </div>
        {versions.length === 0 ? (
          <p className="muted small">Brak zapisanych wersji.</p>
        ) : (
          <ul className="versions">
            {versions.map((v) => (
              <li key={v.id} className="version">
                <span>
                  <strong>{v.name}</strong>{" "}
                  <span className="muted small">
                    · {Math.round(v.score * 100)}% · {new Date(v.createdAt).toLocaleString()}
                  </span>
                </span>
                <span className="version__actions">
                  <button className="btn btn--sm" onClick={() => loadVersionIntoEditor(v.id)}>
                    Wczytaj
                  </button>
                  <button className="btn btn--sm" onClick={() => deleteVersion(v.id)}>
                    Usuń
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="actions">
        <button className="btn" onClick={() => setStep("analysis")}>
          Wstecz
        </button>
        <button
          className="btn"
          disabled={generating}
          onClick={() => downloadMarkdown("cv-dopasowane.md", tailored.markdown)}
        >
          Eksport Markdown
        </button>
        <span className="inline-field">
          <label className="small">Layout PDF:</label>
          <select value={pdfLayout} onChange={(e) => setPdfLayout(e.target.value as PdfLayout)}>
            {PDF_LAYOUTS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </span>
        <button
          className="btn btn--primary"
          disabled={generating}
          onClick={() => exportPdf(tailored.markdown, pdfLayout)}
        >
          Eksport PDF
        </button>
      </div>
    </section>
  )
}
