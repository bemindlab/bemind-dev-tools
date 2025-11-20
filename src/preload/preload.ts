import { contextBridge, ipcRenderer } from "electron";

// Memory API types
export interface MemoryMetrics {
  total: number;
  used: number;
  available: number;
  percentage: number;
  timestamp: number;
}

export interface ProcessMemoryInfo {
  pid: number;
  name: string;
  memory: number;
}

export interface MemoryAPI {
  getMetrics: () => Promise<MemoryMetrics>;
  getTopProcesses: (limit?: number) => Promise<ProcessMemoryInfo[]>;
}

export interface BrowserProfile {
  browser: string;
  profileName: string;
  profilePath: string;
  cookiesPath: string;
}

export interface CookiesAPI {
  getBrowserProfiles: () => Promise<BrowserProfile[]>;
  setSource: (source: string) => Promise<void>;
  getAll: () => Promise<any[]>;
  delete: (name: string, domain: string, path: string) => Promise<void>;
  clearAll: () => Promise<{ count: number }>;
}

// Define the API interface for type safety
export interface PortsAPI {
  // Port scanning
  scanPorts: (range?: { start: number; end: number }) => Promise<any[]>;
  getPort: (port: number) => Promise<any | null>;

  // Port actions
  killProcess: (
    port: number,
    force?: boolean
  ) => Promise<{ success: boolean; message?: string }>;
  openInBrowser: (
    port: number,
    protocol?: "http" | "https"
  ) => Promise<{ success: boolean; message?: string }>;

  // Monitoring controls
  startMonitoring: (interval: number) => Promise<any[]>;
  stopMonitoring: () => Promise<void>;

  // Event listeners
  onPortAdded: (callback: (portInfo: any) => void) => () => void;
  onPortRemoved: (callback: (portInfo: any) => void) => () => void;
  onPortUpdated: (callback: (portInfo: any) => void) => () => void;
}

// Expose protected methods via contextBridge
contextBridge.exposeInMainWorld("portsAPI", {
  // Port scanning
  scanPorts: (range?: { start: number; end: number }) =>
    ipcRenderer.invoke("ports:scan", range),

  getPort: (port: number) => ipcRenderer.invoke("ports:get", port),

  // Port actions
  killProcess: (port: number, force?: boolean) =>
    ipcRenderer.invoke("ports:kill", port, force),

  openInBrowser: (port: number, protocol?: "http" | "https") =>
    ipcRenderer.invoke("ports:open-browser", port, protocol),

  // Monitoring controls
  startMonitoring: (interval: number) =>
    ipcRenderer.invoke("ports:start-monitoring", interval),

  stopMonitoring: () => ipcRenderer.invoke("ports:stop-monitoring"),

  // Event listeners with cleanup
  onPortAdded: (callback: (portInfo: any) => void) => {
    const listener = (_event: any, portInfo: any) => callback(portInfo);
    ipcRenderer.on("ports:added", listener);
    return () => ipcRenderer.removeListener("ports:added", listener);
  },

  onPortRemoved: (callback: (portInfo: any) => void) => {
    const listener = (_event: any, portInfo: any) => callback(portInfo);
    ipcRenderer.on("ports:removed", listener);
    return () => ipcRenderer.removeListener("ports:removed", listener);
  },

  onPortUpdated: (callback: (portInfo: any) => void) => {
    const listener = (_event: any, portInfo: any) => callback(portInfo);
    ipcRenderer.on("ports:updated", listener);
    return () => ipcRenderer.removeListener("ports:updated", listener);
  },
} as PortsAPI);

// Expose memory API
contextBridge.exposeInMainWorld("memoryAPI", {
  getMetrics: () => ipcRenderer.invoke("memory:get-metrics"),
  getTopProcesses: (limit?: number) => ipcRenderer.invoke("memory:get-top-processes", limit),
} as MemoryAPI);

// Expose cookies API
contextBridge.exposeInMainWorld("cookiesAPI", {
  getBrowserProfiles: () => ipcRenderer.invoke("cookies:getBrowserProfiles"),
  setSource: (source: string) => ipcRenderer.invoke("cookies:setSource", source),
  getAll: () => ipcRenderer.invoke("cookies:getAll"),
  delete: (name: string, domain: string, path: string) =>
    ipcRenderer.invoke("cookies:delete", name, domain, path),
  clearAll: () => ipcRenderer.invoke("cookies:clearAll"),
} as CookiesAPI);
