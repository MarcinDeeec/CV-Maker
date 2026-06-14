import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

// Konfiguracja przyjazna dla Tauri:
// - stały port 5173 (devUrl w tauri.conf.json),
// - clearScreen:false, żeby nie czyścić logów Rusta,
// - envPrefix obejmuje TAURI_*, by build desktopowy widział zmienne.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_"],
  server: {
    port: 5173,
    strictPort: true,
  },
})
