# Local Ports Manager

[![Electron](https://img.shields.io/badge/platform-Electron-blue?logo=electron&logoColor=white&style=flat-square)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/build-Vite-yellowgreen?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/ui-React-blueviolet?logo=react&logoColor=white&style=flat-square)](https://react.dev/)
[![License](https://img.shields.io/github/license/local-ports-manager?style=flat-square)](LICENSE.md)

A cross-platform Electron app that centralizes visibility and control over local development ports.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Layout](#project-layout)
- [Development Tasks](#development-tasks)
- [Packaging](#packaging)
- [Security & Requirements](#security--requirements)
- [TypeScript Tooling](#typescript-tooling)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/local-ports-manager/local-ports-manager.git
cd local-ports-manager

# Install dependencies
npm install
```

## Project Layout

```
local-ports-manager/
├── src/
│   ├── main/          # Electron main process (Node.js)
│   │   └── main.ts    # Main process entry point
│   ├── preload/       # IPC preload scripts
│   │   └── preload.ts # Secure IPC bridge
│   └── renderer/      # React UI (Chromium)
│       ├── main.tsx   # Renderer entry point
│       ├── App.tsx    # Root React component
│       └── index.html # HTML template
├── dist/              # Compiled output (main/preload/renderer bundles)
└── out/               # Packaged applications (zip/dmg targets)
```

## Development Tasks

| Task | Command | Purpose |
| ---- | ------- | ------- |
| 🚧 Dev envelope | `npm run dev` | Starts `tsc` watch for Electron main + Vite dev server for renderer |
| 🏗️ Production build | `npm run build` | Emit `dist/` bundles for both processes |
| ▶️ Run built app | `npm start` | Launch Electron against the `dist/` output |
| 📦 Package | `npm run package` | Build macOS binaries (`zip` + `dmg` when available) |

### Notes

- Running `npm run dev` launches the Electron shell pointing to `http://localhost:5173`, so renderer updates live reload and IPC stays secure.
- Browser-only previews (e.g., `npm run dev -- --host`) show a warning because system ports are handled by the main process via the preload bridge.
- Packaging emits artifacts under `out/Local Ports Manager-<version>-arm64-{mac,zip,dmg}` and requires macOS to create the DMG (`hdiutil` must be runnable).

## Packaging

- `electron-builder` configuration lives in `electron-builder.json`.
- Outputs for macOS: `out/Local Ports Manager-<version>-arm64-mac.zip`, `out/Local Ports Manager-<version>-arm64.dmg`, plus `.blockmap` files.
- macOS DMG creation needs `hdiutil` (sandbox blocking steps unless permissions escalated) and optional Apple code signing for distribution.

## Security & Requirements

Electron hardening:

- ✅ Context isolation
- ✅ Node integration disabled in renderer
- ✅ Remote module disabled
- ✅ Secure IPC channels through `preload/preload.ts`
- ✅ Content Security Policy in renderer templates
- ✅ Platform adapters for macOS, Windows, Linux (see `src/main/services/platform`)

## TypeScript Tooling

- `tsconfig.json` – base options shared across renderer/main/preload.
- `tsconfig.main.json` – CommonJS output for Electron main/preload (now emits into `dist/` to align with `package.json` entry).
- `tsconfig.renderer.json` – Vite-friendly ESNext config for the React UI.
