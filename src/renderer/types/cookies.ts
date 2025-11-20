export interface CookieEntry {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  expirationDate?: number;
  sameSite?: "unspecified" | "no_restriction" | "lax" | "strict";
}

export interface CookieFilter {
  searchTerm: string;
  domain: string;
  url: string;
}

export interface CookieStats {
  totalCount: number;
  totalSize: number;
  domains: string[];
}

export interface CookiesMonitorState {
  refreshInterval: number;
  isPaused: boolean;
}
