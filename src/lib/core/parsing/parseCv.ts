import type { ParsedCv, CvSection, CvSectionId } from "../types"
import { extractKeywords, normalize } from "../keywords"

const SECTION_PATTERNS: { id: CvSectionId; patterns: string[] }[] = [
  { id: "summary", patterns: ["podsumowanie", "profil", "o mnie", "summary", "profile", "about", "cel zawodowy", "objective"] },
  { id: "experience", patterns: ["doswiadczenie", "experience", "praca", "work", "employment", "kariera", "historia zatrudnienia", "work experience"] },
  { id: "skills", patterns: ["umiejetnosci", "skills", "technologie", "stack", "kompetencje", "narzedzia", "technical skills", "tech stack"] },
  { id: "education", patterns: ["edukacja", "wyksztalcenie", "education", "studia", "kursy", "certyfikaty", "certificates", "courses"] },
]

const DEFAULT_TITLES: Record<CvSectionId, string> = {
  header: "Nagłówek",
  summary: "Podsumowanie",
  experience: "Doświadczenie",
  skills: "Umiejętności",
  education: "Edukacja",
  other: "Inne",
}

interface HeaderHit {
  id: CvSectionId
  title: string
}

function cleanHeaderText(line: string): string {
  return line
    .replace(/^[#>*\-\s]+/, "")
    .replace(/[:#*]+\s*$/, "")
    .trim()
}

function detectHeader(line: string): HeaderHit | null {
  const rawTrim = line.trim()
  if (!rawTrim) return null

  const cleaned = cleanHeaderText(line)
  if (!cleaned || cleaned.length > 48) return null
  const norm = normalize(cleaned)

  // 1) Znane sekcje.
  for (const sec of SECTION_PATTERNS) {
    for (const p of sec.patterns) {
      if (norm === p || norm.startsWith(p + " ") || norm.startsWith(p)) {
        return { id: sec.id, title: cleaned }
      }
    }
  }

  // 2) Heurystyka dla nagłówków ogólnych: nagłówek markdown, linia ALL CAPS
  //    lub krótka linia zakończona dwukropkiem.
  const isMarkdownHeading = /^#{1,6}\s+/.test(rawTrim)
  const endsWithColon = /:\s*$/.test(rawTrim)
  const isAllCaps =
    cleaned.length >= 3 &&
    cleaned === cleaned.toUpperCase() &&
    /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(cleaned)
  const looksShortTitle = cleaned.split(/\s+/).length <= 4

  if ((isMarkdownHeading || endsWithColon || isAllCaps) && looksShortTitle) {
    return { id: "other", title: cleaned }
  }
  return null
}

/** Dzieli surowy tekst CV na sekcje (w tym nierozpoznane jako "other") i wyciąga umiejętności. */
export function parseCv(raw: string): ParsedCv {
  const lines = raw.split(/\r?\n/)
  const sections: CvSection[] = []
  let current: CvSection = { id: "header", title: DEFAULT_TITLES.header, content: "" }

  for (const line of lines) {
    const hit = detectHeader(line)
    // Pierwszy ogólny nagłówek na samej górze to zwykle imię/nazwisko — zostaje w nagłówku.
    const isGenericTop =
      hit?.id === "other" && sections.length === 0 && current.content.trim() === ""

    if (hit && !isGenericTop) {
      sections.push(current)
      current = { id: hit.id, title: hit.title || DEFAULT_TITLES[hit.id], content: "" }
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
