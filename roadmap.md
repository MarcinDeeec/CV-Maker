# Roadmap

Local-first aplikacja do uczciwego dopasowywania CV pod oferty pracy.

**Zasada przewodnia rozwoju:** najpierw siatka bezpieczeństwa (testy + CI),
potem dystrybucja (build + release), a dopiero na końcu nowe duże funkcje.
Dzięki temu każda kolejna zmiana jest bezpieczna i odwracalna.

---

# Zrealizowane

## v0.1 — działający proof of concept  ✅
- import CV, wklejenie oferty
- podstawowy parser tekstu
- proste dopasowanie
- jedna wersja wygenerowanego CV
- lokalny zapis
- eksport do Markdown

## v0.2 — lepsza analiza  ✅
- ✅ dokładniejszy parser sekcji CV (nagłówki markdown, ALL CAPS, dwukropek, sekcje "other")
- ✅ scoring dopasowania z wagami (twarde vs miękkie kompetencje)
- ✅ konfiguracja API key w ustawieniach
- ✅ eksport do PDF (przez druk przeglądarki, bez zależności)
- ✅ README po angielsku (+ README.pl.md)

## v0.3 — tryb review-first  ✅
- ✅ akceptowanie / odrzucanie pojedynczych sugestii (CV przekomponowuje się na bieżąco)
- ✅ evidence mapping (z którego fragmentu CV / oferty pochodzi sugestia)
- ✅ wiele zapisanych wersji CV (zapis / wczytanie / usuwanie, lokalnie)

## v0.5 — pierwszy wygodny release  ✅
- ✅ import DOCX (bezzależnościowy, natywny DecompressionStream przeglądarki)
- ✅ kilka layoutów eksportu PDF (klasyczny / kompaktowy / nowoczesny)
- ✅ obsługa wielu providerów OpenAI-compatible (presety: OpenAI, Groq, OpenRouter, Together, Mistral, LocalAI)
- ✅ lepszy UX i czytelne komunikaty błędów (walidacja pliku, mapowanie błędów HTTP)

## v0.7 — wersja półstabilna  ✅
- ✅ PL/EN w interfejsie (i18n bezzależnościowy, przełącznik w nagłówku i ustawieniach, zapis wyboru lokalnie)
- ✅ lepsza jakość promptów (struktura, zakaz fabrykowania faktów, zachowanie języka CV)
- ✅ wersjonowanie projektu (zapis/otwarcie/usuwanie całych projektów CV+oferta)
- ✅ opcjonalny tryb listu motywacyjnego (heurystyka offline + wariant AI, 3 tony, eksport MD)
- ✅ testy jednostkowe rdzenia (wbudowany runner Node, `npm test`, 13 testów)

## v1.0 — release stabilny  ✅
- ✅ opcjonalne wsparcie LocalAI/Ollama bez klucza API (lokalne modele, warunkowy nagłówek Authorization)
- ✅ dopracowany workspace (mapowanie "ł→l" w normalizacji, odznaka "AI: lokalne", wersja v1.0)
- ✅ pełna dokumentacja (architecture / usage / contributing) + czytelny model licencyjny (MIT)
- ✅ desktop build (Tauri v2) — scaffolding `src-tauri/`, skrypty `tauri:dev`/`tauri:build`, komplet ikon, działające okno natywne

---

# Plan dalszy

## v1.1 — Jakość i automatyzacja  🧪  (następny krok)
**Cel:** siatka bezpieczeństwa, zanim dołożymy więcej kodu. Każda zmiana ma być automatycznie sprawdzana.

- [ ] **Testy widoków React** (Vitest + Testing Library)
  - konfiguracja Vitest + jsdom (osobno od testów rdzenia na `node:test`)
  - przypadki: wklejenie CV → analiza pokazuje wynik; akceptacja sugestii zmienia podgląd; przełącznik PL/EN; brak konfiguracji AI → tryb offline
- [ ] **CI na GitHub Actions** (`.github/workflows/ci.yml`)
  - na każdy `push` i `pull_request`: `npm ci` → `typecheck` → `test` → `build`
  - badge statusu w README
- [ ] *(opcjonalnie)* lint (ESLint) + format-check (Prettier) jako osobny krok CI

**Gotowe, gdy:** zielony pipeline na GitHubie blokuje merge przy złamanym teście/buildzie.

## v1.2 — Dystrybucja  📦
**Cel:** zamienić projekt w produkt, który da się zainstalować i pobrać.

- [ ] **`npm run tauri:build`** — pierwszy instalator (`.msi`/`.exe`, docelowo też `.dmg`/`.AppImage`)
- [ ] **GitHub Release** — tag `v1.0.0` + dołączony instalator + changelog
- [ ] **CHANGELOG.md** — prosty, ręczny dziennik zmian (format Keep a Changelog)
- [ ] *(ambitniej)* CI buduje instalatory automatycznie w matrycy systemów (Windows/macOS/Linux) i wrzuca je do Release

**Gotowe, gdy:** ze strony Releases można pobrać działający instalator, a build przeszedł testy.

## v1.3 — Dopracowanie UX i odporność  ✨
**Cel:** szlif tego, co już jest, zanim dosypiemy duże funkcje.

- [ ] stany brzegowe: ładowanie / pusty / błąd dla każdego ekranu
- [ ] przycisk **„Testuj połączenie"** w Ustawieniach AI (szybki ping do endpointu/modelu)
- [ ] lepsze komunikaty i podpowiedzi (np. gdy lokalny serwer nie odpowiada)
- [ ] podstawowa dostępność (a11y): focus, kontrast, etykiety aria, obsługa klawiatury
- [ ] porządki w stylach (zmienne CSS, spójne odstępy), tryb ciemny *(opcjonalnie)*

**Gotowe, gdy:** aplikacja zachowuje się przewidywalnie w sytuacjach błędnych i jest wygodna w obsłudze klawiaturą.

## v2.0 — Większe funkcje  🚀
**Cel:** rozwój wartości produktu. Wybór wg apetytu — fundament (testy, CI, release) już jest, więc zmiany są bezpieczne.

- [ ] profile CV (kilka „baz" CV i szybkie przełączanie między nimi)
- [ ] historia wersji z **porównaniem (diff)** dwóch wygenerowanych CV
- [ ] bogatsze szablony PDF (więcej layoutów, własne kolory/akcenty)
- [ ] ulepszony **scoring ATS** (synonimy, ważenie sekcji, wykrywanie braków krytycznych)
- [ ] **auto-wykrywanie lokalnego modelu** (sprawdzenie, czy Ollama/LocalAI działa, i podpowiedź modeli)
- [ ] więcej języków interfejsu (np. DE/ES) — i18n jest już gotowe na rozbudowę
- [ ] eksport do `.docx` *(opcjonalnie)*

**Gotowe, gdy:** zrealizowano wybrany podzbiór funkcji wraz z testami i wpisem w CHANGELOG.

---

# Backlog / pomysły (nieuszeregowane)

- integracja z Notion / Google Drive (zapis CV w chmurze użytkownika)
- statystyki dopasowań w czasie (lokalne, prywatne)
- tryb „one-click tailor" dla wklejonego linku do oferty
- skróty klawiszowe i paleta poleceń
- testy e2e (Playwright) na wersji webowej
- podpisywanie i notarizacja buildów desktopowych (macOS/Windows)

---

# Jak priorytetyzujemy (notatka dla siebie)

1. **Stabilizacja** przed rozwojem — najpierw testy i CI, żeby nie psuć działającego kodu.
2. **Małe, kompletne kroki** — każdy etap kończy się czymś, co da się odpalić i pokazać.
3. **Rdzeń pozostaje czysty** — logika w `src/lib/core` bez Reacta i API przeglądarki (patrz `architecture.md`).
4. **Bez fabrykowania** — produkt nigdy nie wymyśla doświadczenia; to reguła, nie funkcja.
