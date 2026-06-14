import type { ReactNode } from "react"
import { useProject } from "@/state/useProject"
import { LANGS } from "@/lib/i18n/translations"
import { isAiConfigured, isLocalProvider } from "@/lib/ai/config"
import { Stepper } from "./Stepper"

export function Layout({ children }: { children: ReactNode }) {
  const { setStep, aiConfig, lang, setLang, t } = useProject()
  const aiOn = isAiConfigured(aiConfig)
  const aiLocal = aiOn && isLocalProvider(aiConfig)
  return (
    <div className="app">
      <header className="app__header">
        <button className="app__logo" onClick={() => setStep("start")}>
          🧵 CV Tailor <span className="app__badge">local-first</span>
        </button>
        <div className="app__header-right">
          <div className="lang-switch">
            {LANGS.map((l) => (
              <button
                key={l.id}
                className={`lang-switch__item ${lang === l.id ? "is-active" : ""}`}
                onClick={() => setLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <span className={`app__ai ${aiOn ? "is-on" : "is-off"}`}>
            {aiOn ? (aiLocal ? t("header.ai_local") : t("header.ai_on")) : t("header.ai_off")}
          </span>
          <button className="btn btn--ghost" onClick={() => setStep("settings")}>
            {t("common.settings")}
          </button>
        </div>
      </header>
      <Stepper />
      <main className="app__main">{children}</main>
      <footer className="app__footer">{t("header.footer")} · v1.0</footer>
    </div>
  )
}
