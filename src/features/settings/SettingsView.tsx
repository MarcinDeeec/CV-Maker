import { useState } from "react"
import { useProject } from "@/state/useProject"
import { type AiConfig, PROVIDER_PRESETS, findPreset } from "@/lib/ai/config"

export function SettingsView() {
  const { aiConfig, updateAiConfig, setStep } = useProject()
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
      <h2>Ustawienia AI (BYOK)</h2>
      <p className="muted">
        Klucz API i konfiguracja są zapisywane lokalnie w przeglądarce. Pole z kluczem możesz zostawić
        puste — aplikacja zadziała wtedy w trybie offline (heurystyka bez modelu).
      </p>

      <div className="field">
        <label>Dostawca</label>
        <select value={draft.provider ?? "custom"} onChange={(e) => onProvider(e.target.value)}>
          {PROVIDER_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Endpoint (OpenAI-compatible)</label>
        <input
          value={draft.baseUrl}
          onChange={(e) => set({ baseUrl: e.target.value })}
          disabled={!isCustom}
          placeholder="https://..."
        />
        {!isCustom && (
          <span className="file-status">Ustawiane automatycznie przez wybranego dostawcę.</span>
        )}
      </div>
      <div className="field">
        <label>Model</label>
        <input value={draft.model} onChange={(e) => set({ model: e.target.value })} />
      </div>
      <div className="field">
        <label>Klucz API</label>
        <input
          type="password"
          value={draft.apiKey}
          onChange={(e) => set({ apiKey: e.target.value })}
          placeholder="sk-... (zostaje lokalnie)"
        />
      </div>

      <div className="actions">
        <button className="btn" onClick={() => setStep("start")}>
          Wstecz
        </button>
        <button className="btn btn--primary" onClick={save}>
          Zapisz
        </button>
        {saved && <span className="muted">Zapisano ✓</span>}
      </div>
    </section>
  )
}
