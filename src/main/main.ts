import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { PortScannerService } from "./services/PortScannerService";
import { ProcessMonitor } from "./services/ProcessMonitor";
import { FrameworkDetector } from "./services/FrameworkDetector";
import { PortActionsService } from "./services/PortActionsService";
import { PortInfo } from "./services/platform/types";

let mainWindow: BrowserWindow | null = null;

// Service instances
let portScanner: PortScannerService;
let processMonitor: ProcessMonitor;
let frameworkDetector: FrameworkDetector;
let portActions: PortActionsService;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Security: Enable context isolation
      contextIsolation: true,
      // Security: Disable node integration in renderer
      nodeIntegration: false,
      // Preload script for secure IPC communication
      preload: path.join(__dirname, "../preload/preload.js"),
    },
  });

  // Load the renderer
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Initialize services
function initializeServices(): void {
  // Create service instances
  portScanner = new PortScannerService();
  processMonitor = new ProcessMonitor(portScanner);
  frameworkDetector = new FrameworkDetector();
  portActions = new PortActionsService(portScanner);

  // Set up ProcessMonitor event listeners to forward to renderer
  processMonitor.on("port-added", (portInfo: PortInfo) => {
    const enrichedPort = enrichPortWithFramework(portInfo);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("ports:added", enrichedPort);
    }
  });

  processMonitor.on("port-removed", (portInfo: PortInfo) => {
    const enrichedPort = enrichPortWithFramework(portInfo);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("ports:removed", enrichedPort);
    }
  });

  processMonitor.on("port-updated", (portInfo: PortInfo) => {
    const enrichedPort = enrichPortWithFramework(portInfo);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("ports:updated", enrichedPort);
    }
  });
}

// Enrich port info with framework detection
function enrichPortWithFramework(portInfo: PortInfo): PortInfo {
  const framework = frameworkDetector.detectFramework(portInfo);
  return {
    ...portInfo,
    framework: framework || undefined,
  };
}

// Set up IPC handlers
function setupIPCHandlers(): void {
  // Port scanning handler
  ipcMain.handle(
    "ports:scan",
    async (_event, range?: { start: number; end: number }) => {
      try {
        let ports: PortInfo[];

        if (range && range.start && range.end) {
          // Validate range
          if (!Number.isInteger(range.start) || !Number.isInteger(range.end)) {
            throw new Error("Port range must contain integer values");
          }
          ports = await portScanner.scanPorts(range.start, range.end);
        } else {
          // Default to dev ports
          ports = await portScanner.scanDevPorts();
        }

        // Enrich with framework detection
        const enrichedPorts = ports.map((port) =>
          enrichPortWithFramework(port)
        );

        return enrichedPorts;
      } catch (error) {
        console.error("Error scanning ports:", error);
        throw error;
      }
    }
  );

  // Get specific port handler
  ipcMain.handle("ports:get", async (_event, port: number) => {
    try {
      // Validate port number
      if (!Number.isInteger(port)) {
        throw new Error("Port must be an integer");
      }

      if (port < 1 || port > 65535) {
        throw new Error("Port must be between 1 and 65535");
      }

      const portInfo = await portScanner.getPortInfo(port);

      if (!portInfo) {
        return null;
      }

      // Enrich with framework detection
      return enrichPortWithFramework(portInfo);
    } catch (error) {
      console.error(`Error getting port ${port}:`, error);
      throw error;
    }
  });

  // Kill process handler
  ipcMain.handle("ports:kill", async (_event, port: number) => {
    try {
      // Validate port number
      if (!Number.isInteger(port)) {
        throw new Error("Port must be an integer");
      }

      if (port < 1 || port > 65535) {
        throw new Error("Port must be between 1 and 65535");
      }

      const result = await portActions.killProcess(port);
      return result;
    } catch (error) {
      console.error(`Error killing process on port ${port}:`, error);
      return {
        success: false,
        message: `Failed to kill process: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  });

  // Open in browser handler
  ipcMain.handle(
    "ports:open-browser",
    async (_event, port: number, protocol?: "http" | "https") => {
      try {
        // Validate port number
        if (!Number.isInteger(port)) {
          throw new Error("Port must be an integer");
        }

        if (port < 1 || port > 65535) {
          throw new Error("Port must be between 1 and 65535");
        }

        // Validate protocol if provided
        if (protocol && protocol !== "http" && protocol !== "https") {
          throw new Error('Protocol must be "http" or "https"');
        }

        const result = await portActions.openInBrowser(port, protocol);
        return result;
      } catch (error) {
        console.error(`Error opening port ${port} in browser:`, error);
        return {
          success: false,
          message: `Failed to open browser: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    }
  );

  // Start monitoring handler
  ipcMain.handle("ports:start-monitoring", async (_event, interval: number) => {
    try {
      // Validate interval
      if (!Number.isInteger(interval) || interval < 1000) {
        throw new Error("Interval must be an integer >= 1000ms");
      }

      // Stop existing monitoring if active
      if (processMonitor.isActive()) {
        processMonitor.stop();
      }

      // Start monitoring
      processMonitor.start(interval);

      console.log(`Port monitoring started with interval: ${interval}ms`);
    } catch (error) {
      console.error("Error starting monitoring:", error);
      throw error;
    }
  });

  // Stop monitoring handler
  ipcMain.handle("ports:stop-monitoring", async () => {
    try {
      if (processMonitor.isActive()) {
        processMonitor.stop();
        console.log("Port monitoring stopped");
      }
    } catch (error) {
      console.error("Error stopping monitoring:", error);
      throw error;
    }
  });
}

// App lifecycle
app.whenReady().then(() => {
  // Initialize services and IPC handlers
  initializeServices();
  setupIPCHandlers();

  createWindow();

  app.on("activate", () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Cleanup on app quit
app.on("before-quit", () => {
  if (processMonitor && processMonitor.isActive()) {
    processMonitor.cleanup();
  }
});

// Export for testing purposes
export { mainWindow };
