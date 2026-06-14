import type { ParsedCv, CvSection, CvSectionId } from "../types"
import { extractKeywords, normalize } from "../keywords"

const SECTION_PATTERNS: { id: CvSectionId; patterns: string[] }[] = [
  { id: "summary", patterns: ["podsumowanie", "profil", "o mnie", "summary", "profile", "about"] },
  { id: "experience", patterns: ["doswiadczenie", "experience", "praca", "work", "employment", "kariera"] },
  { id: "skills", patterns: ["umiejetnosci", "skills", "technologie", "stack", "kompetencje", "narzedzia"] },
  { id: "education", patterns: ["edukacja", "wyksztalcenie", "education", "studia", "kursy"] },
]

const DEFAULT_TITLES: Record<CvSectionId, string> = {
  header: "Nagłówek",
  summary: "Podsumowanie",
  experience: "Doświadczenie",
  skills: "Umiejętności",
  education: "Edukacja",
  other: "Inne",
}

function detectHeader(line: string): CvSectionId | null {
  const cleaned = normalize(line.replace(/^[#>*\-\s]+/, "").replace(/[:#*]+$/, "").trim())
  if (!cleaned || cleaned.length > 40) return null
  for (const sec of SECTION_PATTERNS) {
    for (const p of sec.patterns) {
      if (cleaned === p || cleaned.startsWith(p)) return sec.id
    }
  }
  return null
}

/** Dzieli surowy tekst CV na sekcje po nagłówkach i wyciąga listę umiejętności. */
export function parseCv(raw: string): ParsedCv {
  const lines = raw.split(/\r?\n/)
  const sections: CvSection[] = []
  let current: CvSection = { id: "header", title: DEFAULT_TITLES.header, content: "" }

  for (const line of lines) {
    const headerId = detectHeader(line)
    if (headerId) {
      sections.push(current)
      const title = line.replace(/^[#>*\-\s]+/, "").replace(/[:#*]+$/, "").trim() || DEFAULT_TITLES[headerId]
      current = { id: headerId, title, content: "" }
    } else {
      current.content += line + "\n"
    }
  }
  sections.push(current)

  const cleanSections = sections.filter((s) => s.content.trim().length > 0)

  const skillsSection = cleanSections.find((s) => s.id === "skills")
  let skills: string[] = []
  if (skillsSection) {
    skills = skillsSection.content
      .split(/[\n,•·;|]+/)
      .map((s) => s.replace(/^[\-*\s]+/, "").trim())
      .filter((s) => s.length > 1 && s.length < 40)
  }

  const keywords = extractKeywords(raw)
  if (skills.length === 0) skills = keywords.slice(0, 15)

  return { raw, sections: cleanSections, skills, keywords }
}
