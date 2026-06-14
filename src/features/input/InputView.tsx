import { useRef } from "react"
import { useProject } from "@/state/useProject"

export function InputView() {
  const { cvText, setCvText, jobText, setJobText, setStep } = useProject()
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCvText(String(reader.result ?? ""))
    reader.readAsText(file)
  }

  const canContinue = cvText.trim().length > 0 && jobText.trim().length > 0

  return (
    <section className="view">
      <h2>CV i oferta</h2>
      <p className="muted">
        Wklej treść lub wczytaj plik tekstowy. (Import PDF/DOCX przyjdzie w kolejnych etapach roadmapy.)
      </p>

      <div className="grid-2">
        <div className="field">
          <div className="field__head">
            <label>Twoje CV</label>
            <button className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>
              Wczytaj .txt / .md
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              hidden
              onChange={onFile}
            />
          </div>
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Wklej tutaj swoje obecne CV..."
            rows={18}
          />
        </div>

        <div className="field">
          <div className="field__head">
            <label>Oferta pracy</label>
          </div>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Wklej tutaj treść oferty pracy..."
            rows={18}
          />
        </div>
      </div>

      <div className="actions">
        <button className="btn" onClick={() => setStep("start")}>
          Wstecz
        </button>
        <button className="btn btn--primary" disabled={!canContinue} onClick={() => setStep("analysis")}>
          Analizuj
        </button>
      </div>
    </section>
  )
}
