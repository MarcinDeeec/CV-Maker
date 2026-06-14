import { useProject, type Step } from "@/state/useProject"

const STEPS: { id: Step; key: string }[] = [
  { id: "start", key: "step.start" },
  { id: "input", key: "step.input" },
  { id: "analysis", key: "step.analysis" },
  { id: "result", key: "step.result" },
]

export function Stepper() {
  const { step, setStep, t } = useProject()
  return (
    <nav className="stepper">
      {STEPS.map((s) => (
        <button
          key={s.id}
          className={`stepper__item ${step === s.id ? "is-active" : ""}`}
          onClick={() => setStep(s.id)}
        >
          {t(s.key)}
        </button>
      ))}
    </nav>
  )
}
