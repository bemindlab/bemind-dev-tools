import { PortsAPI } from "../../preload/preload";

declare global {
  interface Window {
    portsAPI?: PortsAPI;
  }
}

export {};
