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
    t,
  } = useProject()
  const [openEvidence, setOpenEvidence] = useState<string | null>(null)
  const [versionName, setVersionName] = useState("")
  const [pdfLayout, setPdfLayout] = useState<PdfLayout>("classic")

  if (!tailored) {
    return (
      <section className="view">
        <h2>{t("result.title")}</h2>
        <p className="muted">{t("result.no_result")}</p>
        <button className="btn" onClick={() => setStep("analysis")}>
          {t("result.go_analysis")}
        </button>
      </section>
    )
  }

  const aiLocked = tailored.aiGenerated === true

  return (
    <section className="view">
      <h2>{t("result.title")}</h2>
      {error && <div className="alert">{error}</div>}

      <div className="grid-2">
        <div className="field">
          <div className="field__head">
            <label>{t("result.preview_label")}</label>
          </div>
          <textarea
            value={tailored.markdown}
            onChange={(e) => setTailoredMarkdown(e.target.value)}
            rows={24}
          />
        </div>

        <div className="panel">
          <h3>{t("result.suggestions_title")}</h3>
          {aiLocked && <p className="muted small">{t("result.ai_locked")}</p>}
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
                        ? t("result.hide_source")
                        : `${t("result.show_source")} (${
                            s.evidence.origin === "cv" ? t("result.from_cv") : t("result.from_job")
                          })`}
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
        <h3>
          {t("result.saved_versions")} ({versions.length})
        </h3>
        <div className="version-save">
          <input
            placeholder={t("result.version_name_ph")}
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
            {t("result.save_version")}
          </button>
        </div>
        {versions.length === 0 ? (
          <p className="muted small">{t("result.no_versions")}</p>
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
                    {t("common.load")}
                  </button>
                  <button className="btn btn--sm" onClick={() => deleteVersion(v.id)}>
                    {t("common.delete")}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="actions">
        <button className="btn" onClick={() => setStep("analysis")}>
          {t("common.back")}
        </button>
        <button
          className="btn"
          disabled={generating}
          onClick={() => downloadMarkdown("cv-dopasowane.md", tailored.markdown)}
        >
          {t("result.export_md")}
        </button>
        <span className="inline-field">
          <label className="small">{t("result.pdf_layout")}</label>
          <select value={pdfLayout} onChange={(e) => setPdfLayout(e.target.value as PdfLayout)}>
            {PDF_LAYOUTS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </span>
        <button
          className="btn"
          disabled={generating}
          onClick={() => exportPdf(tailored.markdown, pdfLayout)}
        >
          {t("result.export_pdf")}
        </button>
        <button className="btn btn--primary" onClick={() => setStep("cover")}>
          {t("result.cover_btn")}
        </button>
      </div>
    </section>
  )
}
