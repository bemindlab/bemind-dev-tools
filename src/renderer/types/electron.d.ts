import { PortsAPI, CookiesAPI } from "../../preload/preload";

declare global {
  interface Window {
    portsAPI?: PortsAPI;
    cookiesAPI?: CookiesAPI;
  }
}

export {};
