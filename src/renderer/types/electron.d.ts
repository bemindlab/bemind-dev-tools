import { PortsAPI, CookiesAPI, MemoryAPI } from "../../preload/preload";

declare global {
  interface Window {
    portsAPI?: PortsAPI;
    cookiesAPI?: CookiesAPI;
    memoryAPI?: MemoryAPI;
  }
}

export {};
