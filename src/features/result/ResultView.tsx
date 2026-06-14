import { useProject } from "@/state/useProject"
import { downloadMarkdown } from "@/lib/export/markdown"
import { exportPdf } from "@/lib/export/pdf"

export function ResultView() {
  const { tailored, setTailoredMarkdown, error, setStep, generating } = useProject()

  if (!tailored) {
    return (
      <section className="view">
        <h2>Wynik</h2>
        <p className="muted">Najpierw wygeneruj dopasowane CV w kroku Analiza.</p>
        <button className="btn" onClick={() => setStep("analysis")}>
          Przejdź do analizy
        </button>
      </section>
    )
  }

  return (
    <section className="view">
      <h2>Dopasowane CV</h2>
      {error && <div className="alert">{error}</div>}

      <div className="grid-2">
        <div className="field">
          <div className="field__head">
            <label>Podgląd (możesz edytować)</label>
          </div>
          <textarea
            value={tailored.markdown}
            onChange={(e) => setTailoredMarkdown(e.target.value)}
            rows={22}
          />
        </div>
        <div className="panel">
          <h3>Sugerowane zmiany</h3>
          <ul className="changes">
            {tailored.changes.map((c, i) => (
              <li key={i}>
                <span className={`tag tag--${c.source}`}>{c.source}</span> {c.description}
              </li>
            ))}
          </ul>
        </div>
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
        <button
          className="btn btn--primary"
          disabled={generating}
          onClick={() => exportPdf(tailored.markdown)}
        >
          Eksport PDF
        </button>
      </div>
    </section>
  )
}
