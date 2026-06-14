// Zapobiega otwieraniu dodatkowego okna konsoli na Windows w trybie release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    cv_tailor_lib::run()
}
