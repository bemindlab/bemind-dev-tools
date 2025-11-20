import { CookieEntry } from "../types/cookies";

// Mock data for development
const mockCookies: CookieEntry[] = [
  {
    name: "session_id",
    value: "abc123def456",
    domain: "localhost",
    path: "/",
    secure: false,
    httpOnly: true,
    expirationDate: undefined, // Session cookie
    sameSite: "lax",
  },
  {
    name: "auth_token",
    value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    domain: ".example.com",
    path: "/",
    secure: true,
    httpOnly: true,
    expirationDate: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days from now
    sameSite: "strict",
  },
  {
    name: "preferences",
    value: '{"theme":"dark","lang":"en"}',
    domain: "app.example.com",
    path: "/",
    secure: true,
    httpOnly: false,
    expirationDate: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year
    sameSite: "lax",
  },
];

let mockCookieStore = [...mockCookies];

export const cookiesApi = {
  getAll: async (): Promise<CookieEntry[]> => {
    if (!window.cookiesAPI) {
      // Development mode - return mock data
      console.warn("Cookies API not available, using mock data");
      return Promise.resolve([...mockCookieStore]);
    }
    return await window.cookiesAPI.getAll();
  },

  delete: async (
    name: string,
    domain: string,
    path: string
  ): Promise<void> => {
    if (!window.cookiesAPI) {
      // Development mode - simulate deletion
      console.warn("Cookies API not available, simulating delete");
      mockCookieStore = mockCookieStore.filter(
        (c) => !(c.name === name && c.domain === domain && c.path === path)
      );
      return Promise.resolve();
    }
    return await window.cookiesAPI.delete(name, domain, path);
  },

  clearAll: async (): Promise<{ count: number }> => {
    if (!window.cookiesAPI) {
      // Development mode - simulate clear all
      console.warn("Cookies API not available, simulating clear all");
      const count = mockCookieStore.length;
      mockCookieStore = [];
      return Promise.resolve({ count });
    }
    return await window.cookiesAPI.clearAll();
  },
};

