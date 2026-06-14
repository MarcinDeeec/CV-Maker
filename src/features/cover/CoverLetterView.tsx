import { useState } from "react"
import { useProject } from "@/state/useProject"
import { downloadMarkdown } from "@/lib/export/markdown"
import type { CoverTone } from "@/lib/core/tailoring/coverLetter"

const TONES: { id: CoverTone; key: string }[] = [
  { id: "professional", key: "cover.tone_professional" },
  { id: "friendly", key: "cover.tone_friendly" },
  { id: "concise", key: "cover.tone_concise" },
]

export function CoverLetterView() {
  const {
    parsedCv,
    jobReq,
    match,
    coverLetter,
    setCoverLetter,
    generateCover,
    coverGenerating,
    error,
    setStep,
    t,
  } = useProject()
  const [tone, setTone] = useState<CoverTone>("professional")

  if (!parsedCv || !jobReq || !match) {
    return (
      <section className="view">
        <h2>{t("cover.title")}</h2>
        <p className="muted">{t("cover.need_input")}</p>
        <button className="btn" onClick={() => setStep("input")}>
          {t("analysis.back_to_input")}
        </button>
      </section>
    )
  }

  return (
    <section className="view">
      <h2>{t("cover.title")}</h2>
      <p className="muted">{t("cover.intro")}</p>
      {error && <div className="alert">{error}</div>}

      <div className="actions">
        <span className="inline-field">
          <label className="small">{t("cover.tone")}:</label>
          <select value={tone} onChange={(e) => setTone(e.target.value as CoverTone)}>
            {TONES.map((to) => (
              <option key={to.id} value={to.id}>
                {t(to.key)}
              </option>
            ))}
          </select>
        </span>
        <button
          className="btn btn--primary"
          disabled={coverGenerating}
          onClick={() => generateCover(tone)}
        >
          {coverGenerating
            ? t("common.generating")
            : coverLetter
              ? t("cover.regenerate")
              : t("cover.generate")}
        </button>
      </div>

      <div className="field">
        <textarea
          value={coverLetter ?? ""}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder={t("cover.empty")}
          rows={18}
        />
      </div>

      <div className="actions">
        <button className="btn" onClick={() => setStep("result")}>
          {t("cover.back_to_result")}
        </button>
        <button
          className="btn"
          disabled={!coverLetter}
          onClick={() => coverLetter && downloadMarkdown("list-motywacyjny.md", coverLetter)}
        >
          {t("cover.export_md")}
        </button>
      </div>
    </section>
  )
}
