import { session, Cookie } from "electron";
import { BrowserDetectionService, BrowserProfile } from "./BrowserDetectionService";
import { BrowserCookieReader } from "./BrowserCookieReader";

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
  private browserDetection: BrowserDetectionService;
  private browserReader: BrowserCookieReader;
  private currentSource: string = "electron"; // "electron" or browser profile ID

  constructor() {
    this.browserDetection = new BrowserDetectionService();
    this.browserReader = new BrowserCookieReader();
  }

  /**
   * Get available browser profiles
   */
  async getBrowserProfiles(): Promise<BrowserProfile[]> {
    return await this.browserDetection.detectBrowsers();
  }

  /**
   * Set cookie source (electron or specific browser profile)
   */
  setSource(source: string): void {
    this.currentSource = source;
  }

  /**
   * Get all cookies from current source
   */
  async getAllCookies(): Promise<CookieEntry[]> {
    if (this.currentSource === "electron") {
      return await this.getElectronCookies();
    } else {
      return await this.getBrowserCookies(this.currentSource);
    }
  }

  /**
   * Get all cookies from the Electron session
   */
  private async getElectronCookies(): Promise<CookieEntry[]> {
    try {
      const cookies = await session.defaultSession.cookies.get({});
      return cookies.map(this.mapElectronCookie);
    } catch (error) {
      console.error("Failed to get Electron cookies:", error);
      throw new Error("Failed to retrieve Electron cookies");
    }
  }

  /**
   * Get cookies from a browser profile
   */
  private async getBrowserCookies(profileId: string): Promise<CookieEntry[]> {
    try {
      const profiles = await this.browserDetection.detectBrowsers();
      const profile = profiles.find(
        (p) => `${p.browser}-${p.profileName}` === profileId
      );

      if (!profile) {
        throw new Error(`Browser profile not found: ${profileId}`);
      }

      // Read based on browser type
      if (profile.browser === "Firefox") {
        return await this.browserReader.readFirefoxCookies(profile.cookiesPath);
      } else {
        // Chrome, Edge, Brave all use Chromium format
        return await this.browserReader.readChromiumCookies(profile.cookiesPath);
      }
    } catch (error) {
      console.error("Failed to get browser cookies:", error);
      throw new Error(`Failed to retrieve browser cookies: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a specific cookie (only works for Electron cookies)
   */
  async deleteCookie(name: string, domain: string, path: string): Promise<void> {
    if (this.currentSource !== "electron") {
      throw new Error("Cannot delete cookies from external browsers (read-only)");
    }

    try {
      const url = `https://${domain}${path}`;
      await session.defaultSession.cookies.remove(url, name);
    } catch (error) {
      console.error(`Failed to delete cookie ${name}:`, error);
      throw new Error(`Failed to delete cookie: ${name}`);
    }
  }

  /**
   * Clear all cookies (only works for Electron cookies)
   */
  async clearAllCookies(): Promise<number> {
    if (this.currentSource !== "electron") {
      throw new Error("Cannot clear cookies from external browsers (read-only)");
    }

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
