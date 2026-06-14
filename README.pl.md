# CV Tailor (local-first)

[English version → `README.md`](README.md)

Local-first, privacy-first aplikacja do **uczciwego** dopasowywania CV pod konkretne oferty pracy.
Nie wymyśla doświadczenia — podkreśla to, co naprawdę masz, i pokazuje braki jako sugestie.

> Etap: **v1.0** — stabilny zestaw funkcji. Pełny przepływ: import CV → oferta → analiza →
> dopasowane CV → opcjonalny list motywacyjny → eksport do Markdown / PDF. Interfejs PL/EN.
> Dane i klucz API zostają lokalnie.

## Co potrafi

- Wklejenie / wczytanie CV (`.txt`, `.md`, `.docx`) i treści oferty pracy.
- Podział CV na sekcje (podsumowanie, doświadczenie, umiejętności, edukacja oraz wykryte sekcje własne).
- Wyciągnięcie wymagań z oferty (twarde/miękkie kompetencje).
- **Ważone dopasowanie** + wynik procentowy (twarde kompetencje liczą się podwójnie), lista trafień i braków.
- Tryb **review-first**: akceptacja / odrzucanie pojedynczych sugestii z mapowaniem źródła (evidence).
- Wygenerowanie dopasowanej wersji CV (heurystyka offline lub model AI — BYOK).
- Opcjonalny generator **listu motywacyjnego** (heurystyka offline + wariant AI, 3 tony).
- Interfejs **PL / EN** (przełącznik w nagłówku i w Ustawieniach).
- Wersjonowanie projektów (zapis/otwarcie/usuwanie całych projektów CV+oferta) oraz zapisane wersje CV.
- Kilka layoutów PDF (klasyczny / kompaktowy / nowoczesny).
- Lokalny autozapis; eksport do **Markdown** lub **PDF**.

## Uruchomienie

```bash
npm install
npm run dev
```

Apka wystartuje na `http://localhost:5173`.

Dodatkowe komendy:

```bash
npm run build      # produkcyjny build
npm run typecheck  # sprawdzenie typów
npm run smoke      # szybki test logiki rdzenia (bez UI)
npm test           # testy jednostkowe (wbudowany runner Node, bez dodatkowych zależności)
```

## AI (BYOK — Bring Your Own Key)

W zakładce **Ustawienia** wybierasz dostawcę i model. Trzy tryby:

- **Dostawcy chmurowi** (OpenAI, Groq, OpenRouter, Together, Mistral) wymagają klucza API.
- **Dostawcy lokalni** (LocalAI, Ollama lub własny lokalny endpoint) działają **bez klucza** —
  aplikacja po prostu nie wysyła nagłówka `Authorization`.
- **Bez AI**: zostaw konfigurację pustą — apka działa w pełni offline na generatorze heurystycznym.

Klucz (jeśli używany) zapisywany jest wyłącznie w localStorage przeglądarki.

### Przykład: lokalnie z Ollama

```bash
ollama serve
ollama pull llama3.1
# W Ustawieniach: dostawca "Ollama", model "llama3.1", klucz niepotrzebny.
```

## Prywatność

- CV, oferta i ustawienia nie są wysyłane na żaden serwer aplikacji (nie ma backendu).
- Jedyne wychodzące zapytanie sieciowe to opcjonalne wywołanie wybranego dostawcy AI.

## Dokumentacja

- [`docs/architecture.md`](docs/architecture.md) — warstwy i decyzje projektowe.
- [`docs/usage.md`](docs/usage.md) — instrukcja krok po kroku.
- [`docs/contributing.md`](docs/contributing.md) — jak rozwijać i testować.
- [`docs/roadmap.md`](docs/roadmap.md) — kamienie milowe.

## Licencja

MIT — zobacz [`LICENSE.md`](LICENSE.md).
