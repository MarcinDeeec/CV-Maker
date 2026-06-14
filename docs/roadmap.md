# Roadmap

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

## v1.0 — release stabilny  (w toku)
- ✅ opcjonalne wsparcie LocalAI/Ollama bez klucza API (lokalne modele, warunkowy nagłówek Authorization)
- ✅ dopracowany workspace (mapowanie "ł→l" w normalizacji, odznaka "AI: lokalne", wersja v1.0)
- ✅ pełna dokumentacja (architecture / usage / contributing) + czytelny model licencyjny (MIT)
- ⏳ desktop build (Tauri) — kolejny krok (wymaga toolchainu Rust, budowany lokalnie)
