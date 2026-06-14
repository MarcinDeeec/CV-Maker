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
import type {
  ParsedCv,
  JobRequirements,
  MatchResult,
  TailoredCv,
  SavedVersion,
} from "@/lib/core/types"
import { type AiConfig, DEFAULT_AI_CONFIG } from "@/lib/ai/config"
import { generateWithAi } from "@/lib/ai/client"
import {
  loadAiConfig,
  loadProject,
  loadVersions,
  saveAiConfig,
  saveProject,
  saveVersions,
} from "@/lib/storage/localStore"

export type Step = "start" | "input" | "analysis" | "result" | "settings"

interface ProjectContextValue {
  step: Step
  setStep: (s: Step) => void
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
  reset: () => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const stored = loadProject()
  const [step, setStep] = useState<Step>("start")
  const [cvText, setCvText] = useState(stored?.cvText ?? "")
  const [jobText, setJobText] = useState(stored?.jobText ?? "")
  const [tailored, setTailored] = useState<TailoredCv | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiConfig, setAiConfig] = useState<AiConfig>(loadAiConfig() ?? DEFAULT_AI_CONFIG)
  const [versions, setVersions] = useState<SavedVersion[]>(loadVersions())

  const parsedCv = useMemo(() => (cvText.trim() ? parseCv(cvText) : null), [cvText])
  const jobReq = useMemo(() => (jobText.trim() ? parseJob(jobText) : null), [jobText])
  const match = useMemo(
    () => (parsedCv && jobReq ? matchCvToJob(parsedCv, jobReq) : null),
    [parsedCv, jobReq],
  )

  useEffect(() => {
    saveProject({ cvText, jobText })
  }, [cvText, jobText])

  const generate = useCallback(async () => {
    if (!parsedCv || !jobReq || !match) return
    setGenerating(true)
    setError(null)
    try {
      const base = generateTailoredCv(parsedCv, jobReq, match)
      if (aiConfig.apiKey.trim()) {
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
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

  const reset = useCallback(() => {
    setCvText("")
    setJobText("")
    setTailored(null)
    setError(null)
    setStep("start")
  }, [])

  const value: ProjectContextValue = {
    step,
    setStep,
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
    reset,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error("useProject musi być użyte wewnątrz <ProjectProvider>")
  return ctx
}
