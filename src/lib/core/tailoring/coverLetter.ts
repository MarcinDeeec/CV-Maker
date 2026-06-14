import type { ParsedCv, JobRequirements, MatchResult } from "../types"

export type CoverTone = "professional" | "friendly" | "concise"
export type CoverLang = "pl" | "en"

export interface CoverOptions {
  tone?: CoverTone
  lang?: CoverLang
}

function headerName(cv: ParsedCv): string {
  const header = cv.sections.find((s) => s.id === "header")
  const first = (header?.content ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean)
  return (first ?? "").replace(/^#+\s*/, "").trim()
}

function jobTitle(job: JobRequirements): string {
  return (
    job.raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find(Boolean) ?? ""
  )
}

/**
 * Heurystyczny list motywacyjny — oparty WYŁĄCZNIE na realnych, dopasowanych
 * kompetencjach (match.breakdown.hard.matched). Nie wymyśla nowych faktów.
 */
export function generateCoverLetter(
  cv: ParsedCv,
  job: JobRequirements,
  match: MatchResult,
  opts: CoverOptions = {},
): string {
  const lang: CoverLang = opts.lang ?? "pl"
  const tone: CoverTone = opts.tone ?? "professional"
  const name = headerName(cv) || (lang === "pl" ? "[Imię i nazwisko]" : "[Your name]")
  const title = jobTitle(job) || (lang === "pl" ? "oferowane stanowisko" : "the advertised role")
  const strengths = match.breakdown.hard.matched.slice(0, 5)

  if (lang === "en") return buildEn(name, title, strengths, tone)
  return buildPl(name, title, strengths, tone)
}

function listOr(items: string[], fallback: string): string {
  return items.length > 0 ? items.join(", ") : fallback
}

function buildPl(name: string, title: string, strengths: string[], tone: CoverTone): string {
  const skills = listOr(strengths, "umiejętności opisane w mojej aplikacji")
  const opening =
    tone === "friendly"
      ? "Z przyjemnością aplikuję na to stanowisko — wygląda dokładnie tak, jak kierunek, w którym chcę się rozwijać."
      : tone === "concise"
        ? "Aplikuję na to stanowisko i krótko przedstawiam, dlaczego pasuję do oferty."
        : "Z zainteresowaniem aplikuję na to stanowisko i pozwalam sobie przedstawić swoją kandydaturę."

  const body = `W dotychczasowej pracy rozwijałem(-am) kompetencje wprost związane z Państwa wymaganiami: ${skills}.`
  const motivation =
    tone === "concise"
      ? ""
      : "\n\nZależy mi na dalszym rozwoju w tym obszarze i wierzę, że mogę wnieść realną wartość do Państwa zespołu."
  const closing =
    tone === "friendly" ? "Pozdrawiam serdecznie," : "Z poważaniem,"

  return [
    "Szanowni Państwo,",
    "",
    `${opening} Aplikuję na stanowisko: ${title}.`,
    "",
    body + motivation,
    "",
    "Chętnie opowiem o szczegółach podczas rozmowy. Dziękuję za poświęcony czas.",
    "",
    closing,
    name,
    "",
  ].join("\n")
}

function buildEn(name: string, title: string, strengths: string[], tone: CoverTone): string {
  const skills = listOr(strengths, "the skills described in my application")
  const opening =
    tone === "friendly"
      ? "I'm excited to apply for this role — it's exactly the direction I want to grow in."
      : tone === "concise"
        ? "I'm applying for this role and will briefly explain why I'm a good fit."
        : "I am writing to express my interest in this position and to present my candidacy."

  const body = `In my work so far I have developed skills directly relevant to your requirements: ${skills}.`
  const motivation =
    tone === "concise"
      ? ""
      : "\n\nI am keen to keep growing in this area and believe I can bring real value to your team."
  const closing = tone === "friendly" ? "Best regards," : "Sincerely,"

  return [
    "Dear Hiring Team,",
    "",
    `${opening} I am applying for: ${title}.`,
    "",
    body + motivation,
    "",
    "I would be glad to discuss the details in an interview. Thank you for your time.",
    "",
    closing,
    name,
    "",
  ].join("\n")
}
