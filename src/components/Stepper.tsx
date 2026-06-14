import { useProject, type Step } from "@/state/useProject"

const STEPS: { id: Step; label: string }[] = [
  { id: "start", label: "1. Start" },
  { id: "input", label: "2. CV i oferta" },
  { id: "analysis", label: "3. Analiza" },
  { id: "result", label: "4. Wynik" },
]

export function Stepper() {
  const { step, setStep } = useProject()
  return (
    <nav className="stepper">
      {STEPS.map((s) => (
        <button
          key={s.id}
          className={`stepper__item ${step === s.id ? "is-active" : ""}`}
          onClick={() => setStep(s.id)}
        >
          {s.label}
        </button>
      ))}
    </nav>
  )
}
