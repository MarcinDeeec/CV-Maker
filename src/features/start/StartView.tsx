import { useProject } from "@/state/useProject"
import { SAMPLE_CV, SAMPLE_JOB } from "@/lib/samples"

export function StartView() {
  const { setStep, setCvText, setJobText, cvText, jobText } = useProject()

  const loadExample = () => {
    setCvText(SAMPLE_CV)
    setJobText(SAMPLE_JOB)
    setStep("input")
  }

  return (
    <section className="view">
      <h1>Dopasuj swoje CV do oferty</h1>
      <p className="muted">
        Local-first narzędzie, które pomaga uczciwie dopasować CV do konkretnej oferty.
        Nie wymyśla doświadczenia — podkreśla to, co naprawdę masz.
      </p>

      <div className="cards">
        <div className="card">
          <h3>🔒 Prywatność</h3>
          <p>Twoje CV i ustawienia zostają lokalnie w przeglądarce.</p>
        </div>
        <div className="card">
          <h3>🔑 BYOK</h3>
          <p>Używasz własnego klucza API lub lokalnego modelu. Bez AI też działa.</p>
        </div>
        <div className="card">
          <h3>✅ Uczciwie</h3>
          <p>Pokazujemy braki jako sugestie, a nie zmyślone kompetencje.</p>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn--primary" onClick={() => setStep("input")}>
          {cvText || jobText ? "Kontynuuj projekt" : "Nowe dopasowanie"}
        </button>
        <button className="btn" onClick={loadExample}>
          Wczytaj przykład
        </button>
      </div>
    </section>
  )
}
