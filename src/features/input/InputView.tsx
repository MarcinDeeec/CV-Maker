import { useRef, useState } from "react"
import { useProject } from "@/state/useProject"
import { readDocxFile } from "@/lib/import/docx"

export function InputView() {
  const { cvText, setCvText, jobText, setJobText, setStep } = useProject()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [loadedName, setLoadedName] = useState<string | null>(null)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError(null)
    setLoadedName(null)
    const name = file.name.toLowerCase()
    try {
      setLoading(true)
      let text = ""
      if (name.endsWith(".docx")) {
        text = await readDocxFile(file)
      } else if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
        text = await file.text()
      } else {
        throw new Error("Obsługiwane formaty: .txt, .md, .docx")
      }
      if (!text.trim()) throw new Error("Plik jest pusty albo nie udało się odczytać tekstu.")
      setCvText(text)
      setLoadedName(file.name)
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Nie udało się wczytać pliku.")
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const canContinue = cvText.trim().length > 0 && jobText.trim().length > 0

  return (
    <section className="view">
      <h2>CV i oferta</h2>
      <p className="muted">
        Wklej treść lub wczytaj plik. Obsługiwane formaty CV: <strong>.txt, .md, .docx</strong>.
      </p>

      <div className="grid-2">
        <div className="field">
          <div className="field__head">
            <label>Twoje CV</label>
            <button
              className="btn btn--ghost btn--sm"
              disabled={loading}
              onClick={() => fileRef.current?.click()}
            >
              {loading ? "Wczytywanie…" : "Wczytaj .txt / .md / .docx"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hidden
              onChange={onFile}
            />
          </div>
          {fileError && <div className="alert">{fileError}</div>}
          {loadedName && !fileError && (
            <p className="file-status">Wczytano: {loadedName}</p>
          )}
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
        <button
          className="btn btn--primary"
          disabled={!canContinue}
          onClick={() => setStep("analysis")}
        >
          Analizuj
        </button>
      </div>
    </section>
  )
}
