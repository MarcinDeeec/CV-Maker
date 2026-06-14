import type { StoredProject } from "../core/types"
import type { AiConfig } from "../ai/config"

// Prosty lokalny storage na bazie localStorage (v0.1).
// W późniejszych etapach można wymienić tę warstwę na SQLite/pliki bez ruszania UI.

const PROJECT_KEY = "cv-tailor:project"
const AI_KEY = "cv-tailor:ai-config"

export function loadProject(): StoredProject | null {
  try {
    const raw = localStorage.getItem(PROJECT_KEY)
    return raw ? (JSON.parse(raw) as StoredProject) : null
  } catch {
    return null
  }
}

export function saveProject(project: StoredProject): void {
  try {
    localStorage.setItem(
      PROJECT_KEY,
      JSON.stringify({ ...project, updatedAt: new Date().toISOString() }),
    )
  } catch {
    // brak dostępu do localStorage — ignorujemy w v0.1
  }
}

export function loadAiConfig(): AiConfig | null {
  try {
    const raw = localStorage.getItem(AI_KEY)
    return raw ? (JSON.parse(raw) as AiConfig) : null
  } catch {
    return null
  }
}

export function saveAiConfig(config: AiConfig): void {
  try {
    localStorage.setItem(AI_KEY, JSON.stringify(config))
  } catch {
    // ignorujemy
  }
}
