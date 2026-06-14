# App icons

Tauri wymaga zestawu ikon do `tauri build` (oraz `icon.ico` na Windows i `icon.icns` na macOS).
Nie są one trzymane w repo — wygeneruj je z jednego źródłowego PNG (zalecane ≥ 1024×1024):

```bash
npx tauri icon ./app-icon.png
```

Komenda utworzy w tym folderze m.in.:

- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns`  (macOS)
- `icon.ico`   (Windows)

Pliki te są już wpisane w `bundle.icon` w `tauri.conf.json`.

> `tauri dev` zwykle uruchomi się bez kompletu ikon, ale `tauri build` ich wymaga —
> wygeneruj je przed pierwszym buildem produkcyjnym.
