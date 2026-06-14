// Szybki test logiki rdzenia bez UI. Uruchom: npm run smoke
import { parseCv } from "../src/lib/core/parsing/parseCv"
import { parseJob } from "../src/lib/core/parsing/parseJob"
import { matchCvToJob } from "../src/lib/core/matching/match"
import {
  buildSuggestions,
  composeCv,
  generateTailoredCv,
} from "../src/lib/core/tailoring/generateCv"
import { documentXmlToText } from "../src/lib/import/docx"
import { mdToHtml, PDF_LAYOUTS } from "../src/lib/export/pdf"
import { SAMPLE_CV, SAMPLE_JOB } from "../src/lib/samples"

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("❌ ASSERT FAILED: " + msg)
    process.exit(1)
  }
}

const cv = parseCv(SAMPLE_CV)
const job = parseJob(SAMPLE_JOB)
const match = matchCvToJob(cv, job)

console.log("Sekcje CV:        ", cv.sections.map((s) => s.id))
console.log("Wynik ważony:     ", Math.round(match.score * 100) + "%")
console.log("Twarde — pasuje:  ", match.breakdown.hard.matched)

const suggestions = buildSuggestions(cv, job, match)
const reorder = suggestions.find((s) => s.id === "reorderSkills")
assert(!!reorder?.evidence && reorder.evidence.origin === "cv", "reorderSkills ma evidence z CV")

const defaultMd = generateTailoredCv(cv, job, match).markdown
assert(!defaultMd.includes("Do rozważenia"), "domyślnie brak sekcji 'Do rozważenia'")
const toggled = suggestions.map((s) =>
  s.id === "noteMissingHard" ? { ...s, accepted: true } : s,
)
assert(composeCv(cv, job, match, toggled).includes("Do rozważenia"), "akceptacja dodaje sekcję")

// --- v0.5: import DOCX (czysta funkcja XML -> tekst) ---
const sampleXml = `<w:document><w:body>
<w:p><w:r><w:t>Jan Kowalski</w:t></w:r></w:p>
<w:p><w:r><w:t>Junior </w:t></w:r><w:r><w:t>Developer</w:t></w:r></w:p>
<w:p></w:p>
<w:p><w:r><w:t>Python</w:t></w:r><w:tab/><w:r><w:t>SQL</w:t></w:r></w:p>
<w:p><w:r><w:t>Firma &amp; Co.</w:t></w:r></w:p>
</w:body></w:document>`
const docxText = documentXmlToText(sampleXml)
console.log("\n--- DOCX -> tekst ---\n" + docxText)
assert(docxText.includes("Jan Kowalski"), "docx: imię")
assert(docxText.includes("Junior Developer"), "docx: złączone runy w jednej linii")
assert(docxText.includes("Python\tSQL"), "docx: tab między runami")
assert(docxText.includes("Firma & Co."), "docx: encje XML zdekodowane")

// --- v0.5: layouty PDF + konwersja markdown ---
assert(PDF_LAYOUTS.length >= 3, "co najmniej 3 layouty PDF")
assert(mdToHtml("# Tytuł").includes("<h1>Tytuł</h1>"), "mdToHtml: nagłówek H1")
assert(mdToHtml("- a\n- b").includes("<ul>"), "mdToHtml: lista")

console.log("\nSMOKE TEST OK ✅")
