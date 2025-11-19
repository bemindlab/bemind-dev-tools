import { PlatformAdapter } from "./types";
import { MacOSAdapter } from "./MacOSAdapter";
import { WindowsAdapter } from "./WindowsAdapter";
import { LinuxAdapter } from "./LinuxAdapter";

/**
 * Factory for creating platform-specific adapters
 */
export class PlatformAdapterFactory {
  private static instance: PlatformAdapter | null = null;

  /**
   * Get the appropriate platform adapter for the current OS
   */
  static getAdapter(): PlatformAdapter {
    if (this.instance) {
      return this.instance;
    }

    const platform = process.platform;

    switch (platform) {
      case "darwin":
        this.instance = new MacOSAdapter();
        break;
      case "win32":
        this.instance = new WindowsAdapter();
        break;
      case "linux":
        this.instance = new LinuxAdapter();
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return this.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Get the current platform name
   */
  static getPlatformName(): string {
    const platform = process.platform;
    switch (platform) {
      case "darwin":
        return "macOS";
      case "win32":
        return "Windows";
      case "linux":
        return "Linux";
      default:
        return platform;
    }
  }
}
