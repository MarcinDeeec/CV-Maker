// Testy jednostkowe rdzenia — wbudowany runner Node (zero zewnętrznych zależności).
// Uruchom: npm test   (czyli: tsx --test test/core.test.ts)
import { test } from "node:test"
import assert from "node:assert/strict"

import {
  normalize,
  tokenize,
  extractKeywords,
  unique,
  stripDiacritics,
} from "../src/lib/core/keywords"
import { parseCv } from "../src/lib/core/parsing/parseCv"
import { parseJob } from "../src/lib/core/parsing/parseJob"
import { matchCvToJob } from "../src/lib/core/matching/match"
import {
  buildSuggestions,
  composeCv,
  generateTailoredCv,
} from "../src/lib/core/tailoring/generateCv"
import { generateCoverLetter } from "../src/lib/core/tailoring/coverLetter"
import { documentXmlToText } from "../src/lib/import/docx"
import { mdToHtml, PDF_LAYOUTS } from "../src/lib/export/pdf"
import { SAMPLE_CV, SAMPLE_JOB } from "../src/lib/samples"

const cv = parseCv(SAMPLE_CV)
const job = parseJob(SAMPLE_JOB)
const match = matchCvToJob(cv, job)

test("normalize: usuwa dekomponowalne znaki diakrytyczne i zmienia na małe litery", () => {
  // NFD rozkłada większość znaków (é, ó, ź, ć), więc znikają one ze stringa.
  assert.equal(normalize("RÉSUMÉ Ćma"), "resume cma")
  assert.equal(stripDiacritics("żarówka"), "zarowka")
  // v1.0: "ł" jest mapowane ręcznie (NFD go nie rozkłada).
  assert.equal(normalize("Łódź"), "lodz")
  assert.equal(stripDiacritics("Łukasz"), "Lukasz")
})

test("unique: usuwa duplikaty z zachowaniem kolejności", () => {
  assert.deepEqual(unique(["a", "b", "a", "c", "b"]), ["a", "b", "c"])
})

test("tokenize: zachowuje terminy ze znakami +, # i .", () => {
  const toks = tokenize("Znam C++, C# oraz Node.js i React.")
  assert.ok(toks.includes("c++"), "c++ powinno przetrwać tokenizację")
  assert.ok(toks.includes("c#"), "c# powinno przetrwać tokenizację")
  assert.ok(toks.includes("node.js"), "node.js powinno przetrwać tokenizację")
  // kropka kończąca zdanie nie powinna zostawać przyklejona
  assert.ok(toks.includes("react"), "react bez kropki końcowej")
})

test("extractKeywords: rozpoznaje znane terminy techniczne", () => {
  const kws = extractKeywords(SAMPLE_CV)
  assert.ok(kws.includes("python"))
  assert.ok(kws.includes("react"))
  // "java" nie powinno trafiać jako fałszywe dopasowanie do "javascript"
  assert.ok(!kws.includes("java"))
})

test("parseCv: wykrywa nagłówek i umiejętności", () => {
  const ids = cv.sections.map((s) => s.id)
  assert.ok(ids.includes("header"))
  assert.ok(cv.skills.length > 0, "lista skills nie powinna być pusta")
})

test("parseJob: wyodrębnia twarde kompetencje z oferty", () => {
  assert.ok(job.hardSkills.includes("react"))
  assert.ok(job.hardSkills.includes("typescript"))
})

test("matchCvToJob: wynik ważony w zakresie 0..1 i wykrywa trafienia", () => {
  assert.ok(match.score >= 0 && match.score <= 1)
  assert.ok(match.breakdown.hard.matched.includes("react"))
  // typescript jest w ofercie, ale nie w przykładowym CV -> brak
  assert.ok(match.breakdown.hard.missing.includes("typescript"))
})

test("buildSuggestions: reorderSkills ma evidence pochodzące z CV", () => {
  const suggestions = buildSuggestions(cv, job, match)
  const reorder = suggestions.find((s) => s.id === "reorderSkills")
  assert.ok(reorder, "powinna istnieć sugestia reorderSkills")
  assert.equal(reorder?.evidence?.origin, "cv")
})

test("composeCv: akceptacja noteMissingHard dodaje sekcję 'Do rozważenia'", () => {
  const defaultMd = generateTailoredCv(cv, job, match).markdown
  assert.ok(!defaultMd.includes("Do rozważenia"), "domyślnie brak sekcji")
  const suggestions = buildSuggestions(cv, job, match).map((s) =>
    s.id === "noteMissingHard" ? { ...s, accepted: true } : s,
  )
  assert.ok(composeCv(cv, job, match, suggestions).includes("Do rozważenia"))
})

test("generateCoverLetter: PL opiera się na realnych kompetencjach", () => {
  const letter = generateCoverLetter(cv, job, match, { tone: "professional", lang: "pl" })
  assert.ok(letter.includes("Szanowni Państwo"))
  const skill = match.breakdown.hard.matched[0]
  assert.ok(letter.includes(skill), `list powinien zawierać dopasowaną kompetencję: ${skill}`)
})

test("generateCoverLetter: EN używa angielskiego nagłówka", () => {
  const letter = generateCoverLetter(cv, job, match, { tone: "concise", lang: "en" })
  assert.ok(letter.includes("Dear Hiring Team"))
})

test("documentXmlToText: łączy runy i dekoduje encje", () => {
  const xml = `<w:document><w:body>
<w:p><w:r><w:t>Junior </w:t></w:r><w:r><w:t>Developer</w:t></w:r></w:p>
<w:p><w:r><w:t>Firma &amp; Co.</w:t></w:r></w:p>
</w:body></w:document>`
  const text = documentXmlToText(xml)
  assert.ok(text.includes("Junior Developer"))
  assert.ok(text.includes("Firma & Co."))
})

test("mdToHtml: escapuje znaki i generuje znaczniki; PDF_LAYOUTS niepuste", () => {
  const html = mdToHtml("# Tytuł\n\nTekst z & znakiem")
  assert.ok(html.includes("&amp;"), "& powinno być zescapowane")
  assert.ok(/<h1>/.test(html), "nagłówek powinien dać <h1>")
  assert.ok(PDF_LAYOUTS.length > 0)
})
