import * as os from "os";
import * as path from "path";
import * as fs from "fs";

export interface BrowserProfile {
  browser: string;
  profileName: string;
  profilePath: string;
  cookiesPath: string;
}

export class BrowserDetectionService {
  private platform: string;
  private homeDir: string;

  constructor() {
    this.platform = os.platform();
    this.homeDir = os.homedir();
  }

  /**
   * Detect all installed browsers and their profiles
   */
  async detectBrowsers(): Promise<BrowserProfile[]> {
    const profiles: BrowserProfile[] = [];

    // Detect Chrome
    profiles.push(...this.detectChrome());

    // Detect Edge
    profiles.push(...this.detectEdge());

    // Detect Brave
    profiles.push(...this.detectBrave());

    // Detect Firefox
    profiles.push(...this.detectFirefox());

    // Filter only profiles that actually exist
    return profiles.filter((profile) => {
      try {
        return fs.existsSync(profile.cookiesPath);
      } catch {
        return false;
      }
    });
  }

  private detectChrome(): BrowserProfile[] {
    const profiles: BrowserProfile[] = [];
    let baseDir: string;

    switch (this.platform) {
      case "darwin": // macOS
        baseDir = path.join(
          this.homeDir,
          "Library/Application Support/Google/Chrome"
        );
        break;
      case "win32": // Windows
        baseDir = path.join(
          process.env.LOCALAPPDATA || "",
          "Google/Chrome/User Data"
        );
        break;
      case "linux":
        baseDir = path.join(this.homeDir, ".config/google-chrome");
        break;
      default:
        return profiles;
    }

    if (!fs.existsSync(baseDir)) {
      return profiles;
    }

    // Default profile
    const defaultProfile = path.join(baseDir, "Default");
    if (fs.existsSync(defaultProfile)) {
      profiles.push({
        browser: "Chrome",
        profileName: "Default",
        profilePath: defaultProfile,
        cookiesPath: path.join(defaultProfile, "Cookies"),
      });
    }

    // Additional profiles (Profile 1, Profile 2, etc.)
    try {
      const entries = fs.readdirSync(baseDir);
      for (const entry of entries) {
        if (entry.startsWith("Profile ")) {
          const profilePath = path.join(baseDir, entry);
          const cookiesPath = path.join(profilePath, "Cookies");
          if (fs.existsSync(cookiesPath)) {
            profiles.push({
              browser: "Chrome",
              profileName: entry,
              profilePath,
              cookiesPath,
            });
          }
        }
      }
    } catch (err) {
      console.error("Error reading Chrome profiles:", err);
    }

    return profiles;
  }

  private detectEdge(): BrowserProfile[] {
    const profiles: BrowserProfile[] = [];
    let baseDir: string;

    switch (this.platform) {
      case "darwin": // macOS
        baseDir = path.join(
          this.homeDir,
          "Library/Application Support/Microsoft Edge"
        );
        break;
      case "win32": // Windows
        baseDir = path.join(
          process.env.LOCALAPPDATA || "",
          "Microsoft/Edge/User Data"
        );
        break;
      case "linux":
        baseDir = path.join(this.homeDir, ".config/microsoft-edge");
        break;
      default:
        return profiles;
    }

    if (!fs.existsSync(baseDir)) {
      return profiles;
    }

    // Default profile
    const defaultProfile = path.join(baseDir, "Default");
    if (fs.existsSync(defaultProfile)) {
      profiles.push({
        browser: "Edge",
        profileName: "Default",
        profilePath: defaultProfile,
        cookiesPath: path.join(defaultProfile, "Cookies"),
      });
    }

    return profiles;
  }

  private detectBrave(): BrowserProfile[] {
    const profiles: BrowserProfile[] = [];
    let baseDir: string;

    switch (this.platform) {
      case "darwin": // macOS
        baseDir = path.join(
          this.homeDir,
          "Library/Application Support/BraveSoftware/Brave-Browser"
        );
        break;
      case "win32": // Windows
        baseDir = path.join(
          process.env.LOCALAPPDATA || "",
          "BraveSoftware/Brave-Browser/User Data"
        );
        break;
      case "linux":
        baseDir = path.join(this.homeDir, ".config/BraveSoftware/Brave-Browser");
        break;
      default:
        return profiles;
    }

    if (!fs.existsSync(baseDir)) {
      return profiles;
    }

    // Default profile
    const defaultProfile = path.join(baseDir, "Default");
    if (fs.existsSync(defaultProfile)) {
      profiles.push({
        browser: "Brave",
        profileName: "Default",
        profilePath: defaultProfile,
        cookiesPath: path.join(defaultProfile, "Cookies"),
      });
    }

    return profiles;
  }

  private detectFirefox(): BrowserProfile[] {
    const profiles: BrowserProfile[] = [];
    let baseDir: string;

    switch (this.platform) {
      case "darwin": // macOS
        baseDir = path.join(
          this.homeDir,
          "Library/Application Support/Firefox/Profiles"
        );
        break;
      case "win32": // Windows
        baseDir = path.join(
          process.env.APPDATA || "",
          "Mozilla/Firefox/Profiles"
        );
        break;
      case "linux":
        baseDir = path.join(this.homeDir, ".mozilla/firefox");
        break;
      default:
        return profiles;
    }

    if (!fs.existsSync(baseDir)) {
      return profiles;
    }

    try {
      const entries = fs.readdirSync(baseDir);
      for (const entry of entries) {
        if (entry.includes(".default") || entry.includes("default-release")) {
          const profilePath = path.join(baseDir, entry);
          const cookiesPath = path.join(profilePath, "cookies.sqlite");
          if (fs.existsSync(cookiesPath)) {
            profiles.push({
              browser: "Firefox",
              profileName: entry,
              profilePath,
              cookiesPath,
            });
          }
        }
      }
    } catch (err) {
      console.error("Error reading Firefox profiles:", err);
    }

    return profiles;
  }
}
