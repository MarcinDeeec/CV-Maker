import { useProject } from "@/state/useProject"

function Chips({ items, tone }: { items: string[]; tone: "ok" | "miss" }) {
  if (items.length === 0) return <p className="muted small">—</p>
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

function Breakdown({
  title,
  matched,
  missing,
}: {
  title: string
  matched: string[]
  missing: string[]
}) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <p className="muted small">Pasuje ({matched.length})</p>
      <Chips items={matched} tone="ok" />
      <p className="muted small label-gap">Braki ({missing.length})</p>
      <Chips items={missing} tone="miss" />
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
  const { hard, soft } = match.breakdown
  const hasSoft = soft.matched.length + soft.missing.length > 0

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
        <strong>{pct}%</strong> dopasowania (ważone: twarde kompetencje liczą się podwójnie)
      </div>

      <Breakdown title="🔧 Twarde kompetencje" matched={hard.matched} missing={hard.missing} />

      {hasSoft && (
        <Breakdown title="🤝 Miękkie kompetencje" matched={soft.matched} missing={soft.missing} />
      )}

      <div className="panel">
        <h3>Wykryte sekcje CV</h3>
        <Chips items={parsedCv.sections.map((s) => s.title)} tone="ok" />
      </div>

      <p className="muted small">
        Braki dodawaj tylko jeśli faktycznie masz takie doświadczenie.
      </p>

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
