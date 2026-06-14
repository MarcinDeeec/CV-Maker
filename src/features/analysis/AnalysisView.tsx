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
  matchedLabel,
  gapsLabel,
  matched,
  missing,
}: {
  title: string
  matchedLabel: string
  gapsLabel: string
  matched: string[]
  missing: string[]
}) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <p className="muted small">
        {matchedLabel} ({matched.length})
      </p>
      <Chips items={matched} tone="ok" />
      <p className="muted small label-gap">
        {gapsLabel} ({missing.length})
      </p>
      <Chips items={missing} tone="miss" />
    </div>
  )
}

export function AnalysisView() {
  const { parsedCv, jobReq, match, generate, generating, setStep, t } = useProject()

  if (!parsedCv || !jobReq || !match) {
    return (
      <section className="view">
        <h2>{t("analysis.title")}</h2>
        <p className="muted">{t("analysis.need_input")}</p>
        <button className="btn" onClick={() => setStep("input")}>
          {t("analysis.back_to_input")}
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

  const matchedLabel = t("analysis.matches")
  const gapsLabel = t("analysis.gaps")

  return (
    <section className="view">
      <h2>{t("analysis.title")}</h2>

      <div className="score">
        <div className="score__bar">
          <div className="score__fill" style={{ width: `${pct}%` }} />
        </div>
        <strong>{pct}%</strong> {t("analysis.match_suffix")}
      </div>

      <Breakdown
        title={t("analysis.hard_title")}
        matchedLabel={matchedLabel}
        gapsLabel={gapsLabel}
        matched={hard.matched}
        missing={hard.missing}
      />

      {hasSoft && (
        <Breakdown
          title={t("analysis.soft_title")}
          matchedLabel={matchedLabel}
          gapsLabel={gapsLabel}
          matched={soft.matched}
          missing={soft.missing}
        />
      )}

      <div className="panel">
        <h3>{t("analysis.detected_sections")}</h3>
        <Chips items={parsedCv.sections.map((s) => s.title)} tone="ok" />
      </div>

      <p className="muted small">{t("analysis.gaps_note")}</p>

      <div className="actions">
        <button className="btn" onClick={() => setStep("input")}>
          {t("common.back")}
        </button>
        <button className="btn btn--primary" onClick={onGenerate} disabled={generating}>
          {generating ? t("common.generating") : t("analysis.generate")}
        </button>
      </div>
    </section>
  )
}
