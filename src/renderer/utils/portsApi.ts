import type { PortsAPI } from "../../preload/preload";

export const BROWSER_API_ERROR =
  "System port access is only available inside the Electron shell. Run Local Ports Manager via `npm run dev` or `npm start` to use the full feature set.";

const browserFallbackPortsAPI: PortsAPI = {
  scanPorts: async () => {
    throw new Error(BROWSER_API_ERROR);
  },
  getPort: async () => {
    throw new Error(BROWSER_API_ERROR);
  },
  killProcess: async () => ({
    success: false,
    message: BROWSER_API_ERROR,
  }),
  openInBrowser: async () => ({
    success: false,
    message: BROWSER_API_ERROR,
  }),
  startMonitoring: async () => {
    throw new Error(BROWSER_API_ERROR);
  },
  stopMonitoring: async () => {
    throw new Error(BROWSER_API_ERROR);
  },
  onPortAdded: () => () => undefined,
  onPortRemoved: () => () => undefined,
  onPortUpdated: () => () => undefined,
};

export const getPortsAPI = (): PortsAPI =>
  window.portsAPI ?? browserFallbackPortsAPI;

export const isElectronRuntime = (): boolean => Boolean(window.portsAPI);
