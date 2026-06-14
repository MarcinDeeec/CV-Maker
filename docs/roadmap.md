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

## v0.3 — tryb review-first
- akceptowanie / odrzucanie pojedynczych sugestii
- evidence mapping (z którego fragmentu CV pochodzi sugestia)
- wiele zapisanych wersji CV

## v0.5 — pierwszy wygodny release
- import DOCX
- kilka layoutów eksportu PDF
- obsługa wielu providerów OpenAI-compatible
- lepszy UX i komunikaty błędów

## v0.7 — wersja półstabilna
- PL/EN w interfejsie
- lepsza jakość promptów
- wersjonowanie projektu
- opcjonalny tryb listu motywacyjnego
- testy jednostkowe rdzenia

## v1.0 — release stabilny
- dopracowany lokalny workspace
- desktop build (Tauri)
- opcjonalne wsparcie LocalAI
- pełna dokumentacja + czytelny model licencyjny
