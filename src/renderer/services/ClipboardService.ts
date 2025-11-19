import { PortInfo } from "../contexts/types";

/**
 * Result of a clipboard operation
 */
export interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Clipboard Service for copying port-related information
 */
export class ClipboardService {
  /**
   * Copy port number to clipboard
   * @param port - Port number to copy
   * @returns Promise with operation result
   */
  static async copyPort(port: number): Promise<ClipboardResult> {
    try {
      await navigator.clipboard.writeText(port.toString());
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to copy port",
      };
    }
  }

  /**
   * Copy localhost URL to clipboard
   * @param port - Port number
   * @param protocol - Protocol to use (http or https), defaults to http
   * @returns Promise with operation result
   */
  static async copyURL(
    port: number,
    protocol: "http" | "https" = "http"
  ): Promise<ClipboardResult> {
    try {
      const url = `${protocol}://localhost:${port}`;
      await navigator.clipboard.writeText(url);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to copy URL",
      };
    }
  }

  /**
   * Copy formatted process information to clipboard
   * @param portInfo - Port information object
   * @returns Promise with operation result
   */
  static async copyProcessInfo(portInfo: PortInfo): Promise<ClipboardResult> {
    try {
      const info = [
        `Port: ${portInfo.port}`,
        `Process: ${portInfo.processName}`,
        `PID: ${portInfo.processId}`,
        `Protocol: ${portInfo.protocol}`,
        `State: ${portInfo.state}`,
      ];

      if (portInfo.framework) {
        info.push(`Framework: ${portInfo.framework.displayName}`);
      }

      if (portInfo.commandLine) {
        info.push(`Command: ${portInfo.commandLine}`);
      }

      const formattedInfo = info.join("\n");
      await navigator.clipboard.writeText(formattedInfo);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to copy process info",
      };
    }
  }

  /**
   * Check if clipboard API is available
   * @returns true if clipboard API is supported
   */
  static isSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.clipboard !== "undefined" &&
      typeof navigator.clipboard.writeText === "function"
    );
  }
}
