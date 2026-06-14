// Punkt wejścia aplikacji Tauri. Trzymamy go w `lib.rs`, aby ten sam kod
// działał na desktopie i (w przyszłości) na mobile (#[mobile_entry_point]).
//
// CV Tailor to aplikacja czysto frontendowa (local-first, dane w localStorage),
// więc nie rejestrujemy żadnych dodatkowych komend ani wtyczek — Tauri tylko
// opakowuje gotowy build z `../dist` w natywne okno (WebView systemu).

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
