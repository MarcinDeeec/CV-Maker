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
import { generateTailoredCv } from "@/lib/core/tailoring/generateCv"
import type { ParsedCv, JobRequirements, MatchResult, TailoredCv } from "@/lib/core/types"
import { type AiConfig, DEFAULT_AI_CONFIG } from "@/lib/ai/config"
import { generateWithAi } from "@/lib/ai/client"
import {
  loadAiConfig,
  loadProject,
  saveAiConfig,
  saveProject,
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
  generating: boolean
  error: string | null
  generate: () => Promise<void>
  aiConfig: AiConfig
  updateAiConfig: (c: AiConfig) => void
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

  const parsedCv = useMemo(() => (cvText.trim() ? parseCv(cvText) : null), [cvText])
  const jobReq = useMemo(() => (jobText.trim() ? parseJob(jobText) : null), [jobText])
  const match = useMemo(
    () => (parsedCv && jobReq ? matchCvToJob(parsedCv, jobReq) : null),
    [parsedCv, jobReq],
  )

  // Autozapis lokalny.
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
          setTailored({
            ...base,
            markdown: ai.markdown,
            changes: [
              { type: "rewrite", source: "ai", description: "Wersja wygenerowana przez model AI (BYOK)." },
              ...base.changes,
            ],
          })
        } catch (e) {
          const msg = e instanceof Error ? e.message : "błąd"
          setError(`AI niedostępne (${msg}). Pokazuję wersję heurystyczną.`)
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

  const updateAiConfig = useCallback((c: AiConfig) => {
    setAiConfig(c)
    saveAiConfig(c)
  }, [])

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
    generating,
    error,
    generate,
    aiConfig,
    updateAiConfig,
    reset,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error("useProject musi być użyte wewnątrz <ProjectProvider>")
  return ctx
}
