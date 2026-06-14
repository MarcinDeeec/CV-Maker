import type { ReactNode } from "react"
import { useProject } from "@/state/useProject"
import { Stepper } from "./Stepper"

export function Layout({ children }: { children: ReactNode }) {
  const { setStep, aiConfig } = useProject()
  return (
    <div className="app">
      <header className="app__header">
        <button className="app__logo" onClick={() => setStep("start")}>
          🧵 CV Tailor <span className="app__badge">local-first</span>
        </button>
        <div className="app__header-right">
          <span className={`app__ai ${aiConfig.apiKey ? "is-on" : "is-off"}`}>
            {aiConfig.apiKey ? "AI: włączone" : "AI: tryb offline"}
          </span>
          <button className="btn btn--ghost" onClick={() => setStep("settings")}>
            Ustawienia
          </button>
        </div>
      </header>
      <Stepper />
      <main className="app__main">{children}</main>
      <footer className="app__footer">
        Dane zostają lokalnie w Twojej przeglądarce · BYOK · v0.1
      </footer>
    </div>
  )
}
