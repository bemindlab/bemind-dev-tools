import { session, Cookie } from "electron";

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

export class CookieMonitorService {
  /**
   * Get all cookies from the default session
   */
  async getAllCookies(): Promise<CookieEntry[]> {
    try {
      const cookies = await session.defaultSession.cookies.get({});
      return cookies.map(this.mapElectronCookie);
    } catch (error) {
      console.error("Failed to get cookies:", error);
      throw new Error("Failed to retrieve cookies");
    }
  }

  /**
   * Delete a specific cookie
   */
  async deleteCookie(name: string, domain: string, path: string): Promise<void> {
    try {
      const url = `https://${domain}${path}`;
      await session.defaultSession.cookies.remove(url, name);
    } catch (error) {
      console.error(`Failed to delete cookie ${name}:`, error);
      throw new Error(`Failed to delete cookie: ${name}`);
    }
  }

  /**
   * Clear all cookies
   */
  async clearAllCookies(): Promise<number> {
    try {
      const cookies = await this.getAllCookies();
      const deletePromises = cookies.map((cookie) =>
        this.deleteCookie(cookie.name, cookie.domain, cookie.path)
      );
      await Promise.all(deletePromises);
      return cookies.length;
    } catch (error) {
      console.error("Failed to clear all cookies:", error);
      throw new Error("Failed to clear all cookies");
    }
  }

  /**
   * Map Electron Cookie to CookieEntry
   */
  private mapElectronCookie(cookie: Cookie): CookieEntry {
    return {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain || "",
      path: cookie.path || "/",
      secure: cookie.secure || false,
      httpOnly: cookie.httpOnly || false,
      expirationDate: cookie.expirationDate,
      sameSite: cookie.sameSite as CookieEntry["sameSite"],
    };
  }
}
