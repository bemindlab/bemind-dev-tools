# Project Overview

This is a cross-platform desktop application built with Electron, React, TypeScript, and Vite. It provides a unified development tools platform with an extensible dashboard architecture. The main feature is a Local Ports Manager that allows for centralized visibility and control over local development ports.

## Architecture

The application follows a hub-and-spoke model, where the dashboard is the central hub and individual tools are spokes. The architecture is designed for extensibility, state isolation, performance, and accessibility.

-   **Main Process**: The Electron main process, written in TypeScript, is located in `src/main`. It handles the application's lifecycle, window management, and native functionalities like port scanning and process management.
-   **Renderer Process**: The user interface is a React application located in `src/renderer`. It's built with Vite and written in TypeScript and JSX.
-   **Preload Script**: A preload script at `src/preload/preload.ts` provides a secure bridge between the main and renderer processes, exposing specific APIs through the `contextBridge`.

## Building and Running

The project uses `pnpm` as the package manager. The following commands are available in `package.json` and can also be run via `make`:

-   **Install dependencies**:
    ```bash
    pnpm install
    ```
-   **Run in development mode**:
    ```bash
    pnpm run dev
    ```
-   **Build for production**:
    ```bash
    pnpm run build
    ```
-   **Run the built application**:
    ```bash
    pnpm start
    ```
-   **Package for distribution**:
    ```bash
    pnpm run package
    ```
-   **Run tests**:
    ```bash
    pnpm test
    ```

## Development Conventions

-   **Code Style**: The project uses TypeScript for type safety. The code is organized into main, renderer, and preload processes.
-   **Testing**: The project uses Vitest for unit and integration tests. Test files are located in the `__tests__` directory within the `src/renderer` folder.
-   **Extensibility**: New tools can be added to the dashboard by creating a new React component and registering it in the `ToolRegistry`. The registration process is centralized in `src/renderer/tools/registerTools.ts`.
-   **State Management**: The application uses React context for state management. The `PortsProvider` and `NavigationProvider` manage the state for the ports manager and navigation, respectively.
-   **IPC**: Communication between the main and renderer processes is handled via Electron's IPC mechanism. The preload script exposes a `portsAPI` to the renderer, which can be used to invoke functions in the main process.
