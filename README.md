# Bemind Dev Tools

[![Electron](https://img.shields.io/badge/platform-Electron-blue?logo=electron&logoColor=white&style=flat-square)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/build-Vite-yellowgreen?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/ui-React-blueviolet?logo=react&logoColor=white&style=flat-square)](https://react.dev/)
[![License](https://img.shields.io/github/license/local-ports-manager?style=flat-square)](LICENSE.md)

A cross-platform Electron app providing a unified development tools platform with an extensible dashboard architecture. Currently features a Local Ports Manager for centralized visibility and control over local development ports, with support for additional tools through a card-based interface.

## Architecture Overview

The Bemind Dev Tools dashboard follows a **hub-and-spoke model** where the dashboard acts as the central hub, and individual tools (like the Ports Manager) are spokes that can be navigated to and from. This design ensures:

- **Extensibility**: New tools can be added without modifying existing tool code
- **State Isolation**: Each tool maintains its own state independently
- **Performance**: Fast navigation and responsive UI with transitions under 300ms
- **Accessibility**: Full keyboard navigation and reduced motion support
- **Persistence**: User preferences and tool states survive application restarts

See [Design Document](.kiro/specs/dev-tools-dashboard/design.md) for detailed architecture and implementation specifications.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Project Layout](#project-layout)
- [Development Tasks](#development-tasks)
- [Packaging](#packaging)
- [Security & Requirements](#security--requirements)
- [TypeScript Tooling](#typescript-tooling)
- [Adding New Tools](#adding-new-tools)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/bemind-tools/dev-tools.git
cd dev-tools

# Install dependencies
pnpm install

# Or use make
make install
```

## Project Layout

```
dev-tools/
├── src/
│   ├── main/          # Electron main process (Node.js)
│   │   ├── main.ts    # Main process entry point
│   │   └── services/  # Platform-specific services
│   ├── preload/       # IPC preload scripts
│   │   └── preload.ts # Secure IPC bridge
│   └── renderer/      # React UI (Chromium)
│       ├── main.tsx   # Renderer entry point
│       ├── App.tsx    # Dashboard root component
│       ├── components/# Dashboard and tool components
│       ├── tools/     # Individual development tools
│       └── index.html # HTML template
├── .kiro/             # Design specs and documentation
│   └── specs/         # Technical specifications
├── dist/              # Compiled output (main/preload/renderer bundles)
└── out/               # Packaged applications (zip/dmg targets)
```

## Development Tasks

| Task                | Command            | Make Command   | Purpose                                                         |
| ------------------- | ------------------ | -------------- | --------------------------------------------------------------- |
| 🚧 Dev envelope     | `pnpm run dev`     | `make dev`     | Starts `tsc` watch + Vite dev server + Electron with hot reload |
| 🏗️ Production build | `pnpm run build`   | `make build`   | Emit `dist/` bundles for both processes                         |
| ▶️ Run built app    | `pnpm start`       | `make start`   | Launch Electron against the `dist/` output                      |
| 📦 Package          | `pnpm run package` | `make package` | Build macOS binaries (`zip` + `dmg` when available)             |
| 🧪 Run tests        | `pnpm test`        | -              | Run test suite with Vitest                                      |
| 🧹 Clean            | -                  | `make clean`   | Remove build artifacts                                          |

### Notes

- Running `pnpm run dev` launches the Electron shell with hot reload pointing to `http://localhost:5173`, so renderer updates live reload and IPC stays secure.
- The dev environment includes `electron-reload` for automatic app restart when main process files change.
- Browser-only previews (e.g., `pnpm run dev:renderer -- --host`) show a warning because system ports are handled by the main process via the preload bridge.
- Packaging emits artifacts under `out/Bemind Dev Tools-<version>-arm64-{mac,zip,dmg}` and requires macOS to create the DMG (`hdiutil` must be runnable).

## Packaging

- `electron-builder` configuration lives in `electron-builder.json`.
- Outputs for macOS: `out/Bemind Dev Tools-<version>-arm64-mac.zip`, `out/Bemind Dev Tools-<version>-arm64.dmg`, plus `.blockmap` files.
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

## Adding New Tools

The dashboard is designed for easy extensibility. To add a new development tool:

1. **Create the tool component** implementing `ToolComponentProps` interface
2. **Register the tool** with metadata in the tool registry
3. **No changes needed** to dashboard core components

Example tool registration:

```typescript
toolRegistry.registerTool({
  id: "api-tester",
  name: "API Tester",
  description: "Test and debug REST APIs",
  icon: "ApiIcon",
  category: ["api", "testing"],
  component: ApiTesterComponent,
  features: ["Send HTTP requests", "View responses", "Save request history"],
});
```

Tools are lazy-loaded for optimal performance and maintain isolated state. See the [Design Document](.kiro/specs/dev-tools-dashboard/design.md) for complete implementation details.
