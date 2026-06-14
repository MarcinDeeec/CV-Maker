# Desktop build (Tauri)

CV Tailor można spakować jako natywną aplikację desktopową przy pomocy **Tauri v2**.
Tauri opakowuje gotowy build z `dist/` w systemowy WebView — mniejsze i lżejsze niż Electron,
bez doklejania całego Chromium.

> Aplikacja jest czysto frontendowa (local-first, dane w `localStorage`), więc warstwa Rust
> nie rejestruje żadnych własnych komend — jedynie tworzy okno.

## Wymagania (jednorazowo, lokalnie)

Tauri potrzebuje toolchainu **Rust** + zależności systemowych. Nie da się tego zbudować
w przeglądarce — instalujesz to na swoim komputerze:

1. **Rust** — https://rustup.rs
2. Zależności systemowe wg systemu — https://tauri.app/start/prerequisites/
   - **Windows:** Microsoft C++ Build Tools + WebView2 (na Win11 jest domyślnie).
   - **macOS:** Xcode Command Line Tools (`xcode-select --install`).
   - **Linux:** `webkit2gtk`, `libappindicator`, `librsvg`, `patchelf` (dokładne pakiety zależą od dystrybucji).
3. CLI Tauri jest już w `devDependencies` (`@tauri-apps/cli`), więc wystarczy `npm install`.

## Ikony (przed pierwszym `tauri build`)

Wygeneruj komplet ikon z jednego źródłowego PNG (≥ 1024×1024):

```bash
npx tauri icon ./app-icon.png
```

Pliki trafią do `src-tauri/icons/` (są już wpisane w `tauri.conf.json`). Szczegóły: `src-tauri/icons/README.md`.

## Uruchomienie i build

```bash
npm install

# tryb deweloperski (hot reload frontu + natywne okno)
npm run tauri:dev

# produkcyjny build + instalatory (.msi/.dmg/.AppImage/.deb wg systemu)
npm run tauri:build
```

`tauri:dev` sam odpala `npm run dev` (Vite na stałym porcie **5173**), a `tauri:build`
najpierw robi `npm run build`, potem pakuje zawartość `dist/`.

Gotowe artefakty znajdziesz w `src-tauri/target/release/bundle/`.

## Co zawiera scaffolding

```
src-tauri/
  Cargo.toml                 zależności Rust (tauri v2, serde)
  build.rs                   hook buildów Tauri
  tauri.conf.json            okno, identyfikator, bundling, ikony
  capabilities/default.json  uprawnienia okna (core:default)
  src/main.rs                wejście binarki → woła lib::run()
  src/lib.rs                 budowa i uruchomienie okna Tauri
  icons/                     (wygeneruj `npx tauri icon`)
```

Dopasowano też `vite.config.ts`: stały port 5173 (`strictPort`), `clearScreen:false`
oraz `envPrefix` obejmujący `TAURI_*`.
