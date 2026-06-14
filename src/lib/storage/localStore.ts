import type { StoredProject, SavedVersion, ProjectSnapshot } from "../core/types"
import type { AiConfig } from "../ai/config"
import type { Lang } from "../i18n/translations"

// Prosty lokalny storage na bazie localStorage.
// W późniejszych etapach można wymienić tę warstwę na SQLite/pliki bez ruszania UI.

const PROJECT_KEY = "cv-tailor:project"
const AI_KEY = "cv-tailor:ai-config"
const VERSIONS_KEY = "cv-tailor:versions"
const LANG_KEY = "cv-tailor:lang"
const PROJECTS_KEY = "cv-tailor:projects"

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // brak dostępu do localStorage — ignorujemy
  }
}

export function loadProject(): StoredProject | null {
  return read<StoredProject | null>(PROJECT_KEY, null)
}

export function saveProject(project: StoredProject): void {
  write(PROJECT_KEY, { ...project, updatedAt: new Date().toISOString() })
}

export function loadAiConfig(): AiConfig | null {
  return read<AiConfig | null>(AI_KEY, null)
}

export function saveAiConfig(config: AiConfig): void {
  write(AI_KEY, config)
}

export function loadVersions(): SavedVersion[] {
  return read<SavedVersion[]>(VERSIONS_KEY, [])
}

export function saveVersions(versions: SavedVersion[]): void {
  write(VERSIONS_KEY, versions)
}

export function loadLang(): Lang | null {
  return read<Lang | null>(LANG_KEY, null)
}

export function saveLang(lang: Lang): void {
  write(LANG_KEY, lang)
}

export function loadProjects(): ProjectSnapshot[] {
  return read<ProjectSnapshot[]>(PROJECTS_KEY, [])
}

export function saveProjects(projects: ProjectSnapshot[]): void {
  write(PROJECTS_KEY, projects)
}
