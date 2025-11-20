import { CookieEntry } from "../types/cookies";

export const cookiesApi = {
  getAll: async (): Promise<CookieEntry[]> => {
    if (!window.cookiesAPI) {
      throw new Error("Cookies API not available");
    }
    return await window.cookiesAPI.getAll();
  },

  delete: async (
    name: string,
    domain: string,
    path: string
  ): Promise<void> => {
    if (!window.cookiesAPI) {
      throw new Error("Cookies API not available");
    }
    return await window.cookiesAPI.delete(name, domain, path);
  },

  clearAll: async (): Promise<{ count: number }> => {
    if (!window.cookiesAPI) {
      throw new Error("Cookies API not available");
    }
    return await window.cookiesAPI.clearAll();
  },
};
