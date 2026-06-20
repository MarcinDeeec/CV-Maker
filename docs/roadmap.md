# Roadmap

## v0.1 — działający proof of concept ✅
- import CV, wklejenie oferty
- podstawowy parser tekstu
- proste dopasowanie
- jedna wersja wygenerowanego CV
- lokalny zapis
- eksport do Markdown

## v0.2 — lepsza analiza ✅
- ✅ dokładniejszy parser sekcji CV (nagłówki markdown, ALL CAPS, dwukropek, sekcje "other")
- ✅ scoring dopasowania z wagami (twarde vs miękkie kompetencje)
- ✅ konfiguracja API key w ustawieniach
- ✅ eksport do PDF (przez druk przeglądarki, bez zależności)
- ✅ README po angielsku (+ README.pl.md)

## v0.3 — tryb review-first ✅
- ✅ akceptowanie / odrzucanie pojedynczych sugestii (CV przekomponowuje się na bieżąco)
- ✅ evidence mapping (z którego fragmentu CV / oferty pochodzi sugestia)
- ✅ wiele zapisanych wersji CV (zapis / wczytanie / usuwanie, lokalnie)

## v0.5 — pierwszy wygodny release ✅
- ✅ import DOCX (bezzależnościowy, natywny DecompressionStream przeglądarki)
- ✅ kilka layoutów eksportu PDF (klasyczny / kompaktowy / nowoczesny)
- ✅ obsługa wielu providerów OpenAI-compatible (presety: OpenAI, Groq, OpenRouter, Together, Mistral, LocalAI)
- ✅ lepszy UX i czytelne komunikaty błędów (walidacja pliku, mapowanie błędów HTTP)

## v0.7 — wersja półstabilna ✅
- ✅ PL/EN w interfejsie (i18n bezzależnościowy, przełącznik w nagłówku i ustawieniach, zapis wyboru lokalnie)
- ✅ lepsza jakość promptów (struktura, zakaz fabrykowania faktów, zachowanie języka CV)
- ✅ wersjonowanie projektu (zapis/otwarcie/usuwanie całych projektów CV+oferta)
- ✅ opcjonalny tryb listu motywacyjnego (heurystyka offline + wariant AI, 3 tony, eksport MD)
- ✅ testy jednostkowe rdzenia (wbudowany runner Node, `npm test`, 13 testów)

## v1.0 — release stabilny ✅
- ✅ opcjonalne wsparcie LocalAI/Ollama bez klucza API (lokalne modele, warunkowy nagłówek Authorization)
- ✅ dopracowany workspace (mapowanie "ł→l" w normalizacji, odznaka "AI: lokalne", wersja v1.0)
- ✅ pełna dokumentacja (architecture / usage / contributing) + czytelny model licencyjny (MIT)
- ✅ desktop build (Tauri 2) — web + desktop

## v1.1 — jakość i CI ✅
- ✅ CI na GitHub Actions: job `quality` (typecheck → test → test:view → smoke → build) + job `tauri` (build desktopu w matrycy Linux/macOS/Windows)
- ✅ testy widoków (Vitest + React Testing Library, jsdom): `Stepper`, `Start`, `Input`, `Analysis`, `Result`, `Settings`, `Cover` — 7 plików / 22 testy
- ✅ bramka pre-commit (bezzależnościowa, `git config core.hooksPath .githooks`): `typecheck` + `test:all` przed każdym commitem
- ✅ raport pokrycia kodu (`vitest run --coverage`, provider v8) — skrypt `test:view:cov`
- ✅ naprawa typowania importu .docx pod nowe lib.dom (Uint8Array<ArrayBuffer> w `Blob`)

## v1.2 — propozycje (do ustalenia)
- testy integracyjne przepływu (Start → Input → Analysis → Result) na złożonym providerze stanu
- testy warstwy eksportu (markdown/pdf) i importu DOCX na realnych próbkach
- bramka pokrycia w CI (minimalny próg %, np. dla `src/lib/core`)
- automatyczny release desktopu (artefakty Tauri publikowane przy tagu)
- e2e smoke w przeglądarce (np. Playwright) dla ścieżki krytycznej
