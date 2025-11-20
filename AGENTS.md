# Repository Guidelines

## Project Structure & Module Organization
- `src/main/`: Electron main process (`main.ts`) and platform services (port scanning, process monitoring, framework detection).
- `src/preload/`: Secure IPC bridge (`preload.ts`) exposed via context isolation.
- `src/renderer/`: React dashboard (`main.tsx`, `App.tsx`), shared UI components, and tool modules under `tools/`.
- `src/renderer/__tests__/`: Vitest suites grouped by `unit/`, `integration/`, and `property/` behavior checks.
- `dist/` and `out/` are build artifacts; avoid committing them. Design docs live in `.kiro/specs/`.

## Build, Test, and Development Commands
- Install deps: `pnpm install` (or `make install` if available).
- Dev loop: `pnpm run dev` to start `tsc` watch, Vite dev server, and Electron with hot reload.
- Build bundles: `pnpm run build` to emit production-ready main/preload/renderer output in `dist/`.
- Package apps: `pnpm run package` (platform-specific variants: `package:mac`, `package:win`, `package:linux`).
- Run the built app: `pnpm start` (expects prior `build`).
- Tests: `pnpm test` for the full suite; `pnpm test:watch` for active development; `pnpm test:coverage` to record coverage.
- Lint/typecheck: `pnpm lint` (TypeScript no-emit). Cleanup: `pnpm run clean`.

## Coding Style & Naming Conventions
- Language: TypeScript with React 18; prefer functional components and hooks.
- Formatting: 2-space indent, double quotes, trailing commas where sensible, and explicit return types for exported functions.
- File naming: React components in `PascalCase.tsx`; hooks in `useName.ts`; tests mirror source paths with `.test.ts[x]`.
- IPC: keep all Electron communication inside `src/preload` and `src/main`; avoid direct Node access from renderer.

## Testing Guidelines
- Framework: Vitest with Testing Library and jsdom. Property-based tests live under `__tests__/property/`, integration flows under `__tests__/integration/`, and focused units under `__tests__/unit/`.
- Prefer naming tests after behaviors (`feature-name.property.test.tsx`) and keep fixtures close to the suite.
- Ensure new UI behaviors include keyboard accessibility and persistence coverage where applicable.

## Commit & Pull Request Guidelines
- Commit style: short imperative summaries; conventional prefixes such as `feat:`, `chore:`, or `fix:` are preferred and used in history.
- Include scope when helpful (e.g., `feat: add port filter to dashboard`).
- PRs should describe user-facing changes, note risk areas, and link issues. Attach screenshots or terminal output for UI or CLI changes, and mention test commands executed.
- Keep changes small and cohesive; update documentation (README, specs, or this file) when altering architecture or workflows.

## Security & Configuration Tips
- Keep Electron security defaults: `contextIsolation: true`, `nodeIntegration: false`; expose only vetted APIs via preload.
- Default ports and ranges are managed in services; avoid hardcoding secrets or host-specific paths.
- Clean up build artifacts before publishing archives to avoid stale binaries.
