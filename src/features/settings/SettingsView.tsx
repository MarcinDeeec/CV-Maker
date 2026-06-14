import { useState } from "react"
import { useProject } from "@/state/useProject"
import { type AiConfig, PROVIDER_PRESETS, findPreset } from "@/lib/ai/config"
import { LANGS } from "@/lib/i18n/translations"

export function SettingsView() {
  const { aiConfig, updateAiConfig, setStep, t, lang, setLang } = useProject()
  const [draft, setDraft] = useState<AiConfig>(aiConfig)
  const [saved, setSaved] = useState(false)

  const set = (patch: Partial<AiConfig>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setSaved(false)
  }

  const onProvider = (id: string) => {
    const preset = findPreset(id)
    if (preset && preset.id !== "custom") {
      set({ provider: id, baseUrl: preset.baseUrl, model: preset.defaultModel })
    } else {
      set({ provider: id })
    }
  }

  const save = () => {
    updateAiConfig(draft)
    setSaved(true)
  }

  const isCustom = (draft.provider ?? "custom") === "custom"

  return (
    <section className="view">
      <h2>{t("settings.title")}</h2>
      <p className="muted">{t("settings.intro")}</p>

      <div className="field">
        <label>{t("settings.language")}</label>
        <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)}>
          {LANGS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>{t("settings.provider")}</label>
        <select value={draft.provider ?? "custom"} onChange={(e) => onProvider(e.target.value)}>
          {PROVIDER_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>{t("settings.endpoint")}</label>
        <input
          value={draft.baseUrl}
          onChange={(e) => set({ baseUrl: e.target.value })}
          disabled={!isCustom}
          placeholder="https://..."
        />
        {!isCustom && <span className="file-status">{t("settings.endpoint_auto")}</span>}
      </div>
      <div className="field">
        <label>{t("settings.model")}</label>
        <input value={draft.model} onChange={(e) => set({ model: e.target.value })} />
      </div>
      <div className="field">
        <label>{t("settings.api_key")}</label>
        <input
          type="password"
          value={draft.apiKey}
          onChange={(e) => set({ apiKey: e.target.value })}
          placeholder={t("settings.api_key_ph")}
        />
      </div>

      <div className="actions">
        <button className="btn" onClick={() => setStep("start")}>
          {t("common.back")}
        </button>
        <button className="btn btn--primary" onClick={save}>
          {t("common.save")}
        </button>
        {saved && <span className="muted">{t("common.saved")}</span>}
      </div>
    </section>
  )
}
