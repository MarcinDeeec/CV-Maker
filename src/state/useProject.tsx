import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { parseCv } from "@/lib/core/parsing/parseCv"
import { parseJob } from "@/lib/core/parsing/parseJob"
import { matchCvToJob } from "@/lib/core/matching/match"
import { composeCv, generateTailoredCv } from "@/lib/core/tailoring/generateCv"
import { generateCoverLetter, type CoverTone } from "@/lib/core/tailoring/coverLetter"
import type {
  ParsedCv,
  JobRequirements,
  MatchResult,
  TailoredCv,
  SavedVersion,
  ProjectSnapshot,
} from "@/lib/core/types"
import { type AiConfig, DEFAULT_AI_CONFIG, isAiConfigured } from "@/lib/ai/config"
import { generateWithAi, generateCoverLetterWithAi } from "@/lib/ai/client"
import { translate, type Lang } from "@/lib/i18n/translations"
import {
  loadAiConfig,
  loadLang,
  loadProject,
  loadProjects,
  loadVersions,
  saveAiConfig,
  saveLang,
  saveProject,
  saveProjects,
  saveVersions,
} from "@/lib/storage/localStore"

export type Step = "start" | "input" | "analysis" | "result" | "settings" | "cover"

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

interface ProjectContextValue {
  step: Step
  setStep: (s: Step) => void
  // i18n
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
  cvText: string
  setCvText: (t: string) => void
  jobText: string
  setJobText: (t: string) => void
  parsedCv: ParsedCv | null
  jobReq: JobRequirements | null
  match: MatchResult | null
  tailored: TailoredCv | null
  setTailoredMarkdown: (md: string) => void
  toggleSuggestion: (id: string) => void
  generating: boolean
  error: string | null
  generate: () => Promise<void>
  aiConfig: AiConfig
  updateAiConfig: (c: AiConfig) => void
  versions: SavedVersion[]
  saveCurrentVersion: (name?: string) => void
  loadVersionIntoEditor: (id: string) => void
  deleteVersion: (id: string) => void
  // wersjonowanie całego projektu (CV + oferta)
  projects: ProjectSnapshot[]
  saveProjectSnapshot: (name?: string) => void
  loadProjectSnapshot: (id: string) => void
  deleteProjectSnapshot: (id: string) => void
  // list motywacyjny
  coverLetter: string | null
  setCoverLetter: (md: string) => void
  coverGenerating: boolean
  generateCover: (tone: CoverTone) => Promise<void>
  reset: () => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const stored = loadProject()
  const [step, setStep] = useState<Step>("start")
  const [lang, setLangState] = useState<Lang>(loadLang() ?? "pl")
  const [cvText, setCvText] = useState(stored?.cvText ?? "")
  const [jobText, setJobText] = useState(stored?.jobText ?? "")
  const [tailored, setTailored] = useState<TailoredCv | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiConfig, setAiConfig] = useState<AiConfig>(loadAiConfig() ?? DEFAULT_AI_CONFIG)
  const [versions, setVersions] = useState<SavedVersion[]>(loadVersions())
  const [projects, setProjects] = useState<ProjectSnapshot[]>(loadProjects())
  const [coverLetter, setCoverLetterState] = useState<string | null>(null)
  const [coverGenerating, setCoverGenerating] = useState(false)

  const parsedCv = useMemo(() => (cvText.trim() ? parseCv(cvText) : null), [cvText])
  const jobReq = useMemo(() => (jobText.trim() ? parseJob(jobText) : null), [jobText])
  const match = useMemo(
    () => (parsedCv && jobReq ? matchCvToJob(parsedCv, jobReq) : null),
    [parsedCv, jobReq],
  )

  useEffect(() => {
    saveProject({ cvText, jobText })
  }, [cvText, jobText])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    saveLang(l)
  }, [])

  const t = useCallback((key: string) => translate(lang, key), [lang])

  const generate = useCallback(async () => {
    if (!parsedCv || !jobReq || !match) return
    setGenerating(true)
    setError(null)
    try {
      const base = generateTailoredCv(parsedCv, jobReq, match)
      if (isAiConfigured(aiConfig)) {
        try {
          const ai = await generateWithAi(cvText, jobText, aiConfig)
          setTailored({ ...base, markdown: ai.markdown, aiGenerated: true })
        } catch (e) {
          const msg = e instanceof Error ? e.message : "błąd"
          setError(`AI niedostępne (${msg}). Pokazuję wersję heurystyczną (review-first).`)
          setTailored(base)
        }
      } else {
        setTailored(base)
      }
    } finally {
      setGenerating(false)
    }
  }, [parsedCv, jobReq, match, aiConfig, cvText, jobText])

  const setTailoredMarkdown = useCallback((md: string) => {
    setTailored((prev) => (prev ? { ...prev, markdown: md } : prev))
  }, [])

  const toggleSuggestion = useCallback(
    (id: string) => {
      setTailored((prev) => {
        if (!prev || prev.aiGenerated) return prev
        const suggestions = prev.suggestions.map((s) =>
          s.id === id ? { ...s, accepted: !s.accepted } : s,
        )
        if (!parsedCv || !jobReq || !match) return { ...prev, suggestions }
        const markdown = composeCv(parsedCv, jobReq, match, suggestions)
        return { ...prev, suggestions, markdown }
      })
    },
    [parsedCv, jobReq, match],
  )

  const updateAiConfig = useCallback((c: AiConfig) => {
    setAiConfig(c)
    saveAiConfig(c)
  }, [])

  const saveCurrentVersion = useCallback(
    (name?: string) => {
      if (!tailored) return
      const version: SavedVersion = {
        id: makeId(),
        name: name && name.trim() ? name.trim() : `Wersja ${versions.length + 1}`,
        markdown: tailored.markdown,
        score: tailored.match.score,
        createdAt: new Date().toISOString(),
      }
      const next = [version, ...versions]
      setVersions(next)
      saveVersions(next)
    },
    [tailored, versions],
  )

  const loadVersionIntoEditor = useCallback(
    (id: string) => {
      const version = versions.find((v) => v.id === id)
      if (version) setTailoredMarkdown(version.markdown)
    },
    [versions, setTailoredMarkdown],
  )

  const deleteVersion = useCallback(
    (id: string) => {
      const next = versions.filter((v) => v.id !== id)
      setVersions(next)
      saveVersions(next)
    },
    [versions],
  )

  // --- Wersjonowanie całego projektu (CV + oferta) ---
  const saveProjectSnapshot = useCallback(
    (name?: string) => {
      if (!cvText.trim() && !jobText.trim()) return
      const snap: ProjectSnapshot = {
        id: makeId(),
        name: name && name.trim() ? name.trim() : `Projekt ${projects.length + 1}`,
        cvText,
        jobText,
        createdAt: new Date().toISOString(),
      }
      const next = [snap, ...projects]
      setProjects(next)
      saveProjects(next)
    },
    [cvText, jobText, projects],
  )

  const loadProjectSnapshot = useCallback(
    (id: string) => {
      const snap = projects.find((p) => p.id === id)
      if (!snap) return
      setCvText(snap.cvText)
      setJobText(snap.jobText)
      setTailored(null)
      setCoverLetterState(null)
      setError(null)
    },
    [projects],
  )

  const deleteProjectSnapshot = useCallback(
    (id: string) => {
      const next = projects.filter((p) => p.id !== id)
      setProjects(next)
      saveProjects(next)
    },
    [projects],
  )

  // --- List motywacyjny ---
  const setCoverLetter = useCallback((md: string) => setCoverLetterState(md), [])

  const generateCover = useCallback(
    async (tone: CoverTone) => {
      if (!parsedCv || !jobReq || !match) return
      setCoverGenerating(true)
      setError(null)
      try {
        const base = generateCoverLetter(parsedCv, jobReq, match, { tone, lang })
        if (isAiConfigured(aiConfig)) {
          try {
            const ai = await generateCoverLetterWithAi(cvText, jobText, aiConfig, { tone, lang })
            setCoverLetterState(ai.markdown)
          } catch (e) {
            const msg = e instanceof Error ? e.message : "błąd"
            setError(`AI niedostępne (${msg}). Pokazuję wersję heurystyczną listu.`)
            setCoverLetterState(base)
          }
        } else {
          setCoverLetterState(base)
        }
      } finally {
        setCoverGenerating(false)
      }
    },
    [parsedCv, jobReq, match, aiConfig, cvText, jobText, lang],
  )

  const reset = useCallback(() => {
    setCvText("")
    setJobText("")
    setTailored(null)
    setCoverLetterState(null)
    setError(null)
    setStep("start")
  }, [])

  const value: ProjectContextValue = {
    step,
    setStep,
    lang,
    setLang,
    t,
    cvText,
    setCvText,
    jobText,
    setJobText,
    parsedCv,
    jobReq,
    match,
    tailored,
    setTailoredMarkdown,
    toggleSuggestion,
    generating,
    error,
    generate,
    aiConfig,
    updateAiConfig,
    versions,
    saveCurrentVersion,
    loadVersionIntoEditor,
    deleteVersion,
    projects,
    saveProjectSnapshot,
    loadProjectSnapshot,
    deleteProjectSnapshot,
    coverLetter,
    setCoverLetter,
    coverGenerating,
    generateCover,
    reset,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error("useProject musi być użyte wewnątrz <ProjectProvider>")
  return ctx
}
