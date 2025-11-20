import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { CookieEntry } from "./CookieMonitorService";

export class BrowserCookieReader {
  /**
   * Read cookies from Chrome/Edge/Brave cookie database
   */
  async readChromiumCookies(cookiesPath: string): Promise<CookieEntry[]> {
    // Copy database to temp file to avoid lock issues
    const tempPath = path.join(
      os.tmpdir(),
      `cookies-${Date.now()}.db`
    );

    try {
      fs.copyFileSync(cookiesPath, tempPath);

      const db = new Database(tempPath, { readonly: true, fileMustExist: true });

      const cookies = db
        .prepare(
          `
        SELECT 
          name,
          value,
          host_key as domain,
          path,
          expires_utc,
          is_secure,
          is_httponly,
          samesite
        FROM cookies
        WHERE NOT is_persistent OR expires_utc > ?
        ORDER BY name
      `
        )
        .all(Date.now() * 1000) as any[];

      db.close();

      return cookies.map((cookie) => ({
        name: cookie.name,
        value: this.decodeValue(cookie.value),
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.is_secure === 1,
        httpOnly: cookie.is_httponly === 1,
        expirationDate: this.convertChromiumTimestamp(cookie.expires_utc),
        sameSite: this.mapSameSite(cookie.samesite),
      }));
    } catch (error) {
      console.error("Error reading Chromium cookies:", error);
      throw new Error(`Failed to read browser cookies: ${(error as Error).message}`);
    } finally {
      // Clean up temp file
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (err) {
        console.warn("Failed to clean up temp file:", err);
      }
    }
  }

  /**
   * Read cookies from Firefox cookie database
   */
  async readFirefoxCookies(cookiesPath: string): Promise<CookieEntry[]> {
    const tempPath = path.join(
      os.tmpdir(),
      `cookies-${Date.now()}.sqlite`
    );

    try {
      fs.copyFileSync(cookiesPath, tempPath);

      const db = new Database(tempPath, { readonly: true, fileMustExist: true });

      const cookies = db
        .prepare(
          `
        SELECT 
          name,
          value,
          host,
          path,
          expiry,
          isSecure,
          isHttpOnly,
          sameSite
        FROM moz_cookies
        WHERE expiry > ?
        ORDER BY name
      `
        )
        .all(Math.floor(Date.now() / 1000)) as any[];

      db.close();

      return cookies.map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.host,
        path: cookie.path,
        secure: cookie.isSecure === 1,
        httpOnly: cookie.isHttpOnly === 1,
        expirationDate: cookie.expiry,
        sameSite: this.mapFirefoxSameSite(cookie.sameSite),
      }));
    } catch (error) {
      console.error("Error reading Firefox cookies:", error);
      throw new Error(`Failed to read Firefox cookies: ${(error as Error).message}`);
    } finally {
      // Clean up temp file
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (err) {
        console.warn("Failed to clean up temp file:", err);
      }
    }
  }

  /**
   * Convert Chromium timestamp (microseconds since 1601) to Unix timestamp
   */
  private convertChromiumTimestamp(chromiumTime: number): number | undefined {
    if (!chromiumTime || chromiumTime === 0) {
      return undefined; // Session cookie
    }

    // Chromium uses Windows epoch (1601-01-01)
    // Unix uses 1970-01-01
    const windowsToUnixEpochDiff = 11644473600;
    const unixTimestamp = chromiumTime / 1000000 - windowsToUnixEpochDiff;

    return Math.floor(unixTimestamp);
  }

  /**
   * Map Chromium SameSite values
   */
  private mapSameSite(
    value: number
  ): "unspecified" | "no_restriction" | "lax" | "strict" {
    switch (value) {
      case 0:
        return "unspecified";
      case 1:
        return "no_restriction";
      case 2:
        return "lax";
      case 3:
        return "strict";
      default:
        return "unspecified";
    }
  }

  /**
   * Map Firefox SameSite values
   */
  private mapFirefoxSameSite(
    value: number
  ): "unspecified" | "no_restriction" | "lax" | "strict" {
    switch (value) {
      case 0:
        return "unspecified";
      case 1:
        return "no_restriction";
      case 2:
        return "lax";
      case 3:
        return "strict";
      default:
        return "unspecified";
    }
  }

  /**
   * Decode cookie value if encrypted
   * Note: Chrome encrypts cookie values on some platforms
   * This is a basic implementation - full decryption requires platform-specific crypto
   */
  private decodeValue(value: string | Buffer): string {
    if (Buffer.isBuffer(value)) {
      // Try to decode as UTF-8
      try {
        return value.toString("utf-8");
      } catch {
        return value.toString("base64");
      }
    }
    return value;
  }
}
