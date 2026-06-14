import { useProject } from "@/state/useProject"

function Chips({ items, tone }: { items: string[]; tone: "ok" | "miss" }) {
  if (items.length === 0) return <p className="muted">—</p>
  return (
    <div className="chips">
      {items.map((i) => (
        <span key={i} className={`chip chip--${tone}`}>
          {i}
        </span>
      ))}
    </div>
  )
}

export function AnalysisView() {
  const { parsedCv, jobReq, match, generate, generating, setStep } = useProject()

  if (!parsedCv || !jobReq || !match) {
    return (
      <section className="view">
        <h2>Analiza</h2>
        <p className="muted">Najpierw dodaj CV i ofertę.</p>
        <button className="btn" onClick={() => setStep("input")}>
          Wróć do wprowadzania
        </button>
      </section>
    )
  }

  const pct = Math.round(match.score * 100)

  const onGenerate = async () => {
    await generate()
    setStep("result")
  }

  return (
    <section className="view">
      <h2>Analiza dopasowania</h2>

      <div className="score">
        <div className="score__bar">
          <div className="score__fill" style={{ width: `${pct}%` }} />
        </div>
        <strong>{pct}%</strong> pokrycia wymagań oferty
      </div>

      <div className="grid-2">
        <div className="panel">
          <h3>✅ Pasuje ({match.matched.length})</h3>
          <Chips items={match.matched} tone="ok" />
        </div>
        <div className="panel">
          <h3>⚠️ Braki ({match.missing.length})</h3>
          <Chips items={match.missing} tone="miss" />
          <p className="muted small">
            Dodaj te elementy tylko jeśli faktycznie masz takie doświadczenie.
          </p>
        </div>
      </div>

      <div className="panel">
        <h3>Wykryte sekcje CV</h3>
        <Chips items={parsedCv.sections.map((s) => s.title)} tone="ok" />
      </div>

      <div className="actions">
        <button className="btn" onClick={() => setStep("input")}>
          Wstecz
        </button>
        <button className="btn btn--primary" onClick={onGenerate} disabled={generating}>
          {generating ? "Generuję..." : "Generuj dopasowane CV"}
        </button>
      </div>
    </section>
  )
}
