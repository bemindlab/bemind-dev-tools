import { shell } from "electron";
import { PlatformAdapterFactory } from "./platform/PlatformAdapterFactory";
import { PortScannerService } from "./PortScannerService";

/**
 * Result of a port action operation
 */
export interface ActionResult {
  success: boolean;
  message?: string;
  error?: Error;
}

/**
 * Port Actions Service
 *
 * Executes actions on ports and processes including termination and browser opening
 */
export class PortActionsService {
  private platformAdapter = PlatformAdapterFactory.getAdapter();
  private portScanner: PortScannerService;

  /**
   * Create a new PortActionsService
   * @param portScanner Port scanner service instance for port lookups
   */
  constructor(portScanner: PortScannerService) {
    this.portScanner = portScanner;
  }

  /**
   * Kill the process using a specific port
   * @param port Port number
   * @param force Whether to force kill the process (default: false)
   * @returns Action result with success status and message
   */
  async killProcess(
    port: number,
    force: boolean = false
  ): Promise<ActionResult> {
    try {
      // Get port information to find the process ID
      const portInfo = await this.portScanner.getPortInfo(port);

      if (!portInfo) {
        return {
          success: false,
          message: `No process found using port ${port}`,
        };
      }

      const { processId, processName } = portInfo;

      // Check if process requires elevated permissions
      const requiresElevation = await this.platformAdapter.requiresElevation(
        processId
      );

      if (requiresElevation) {
        return {
          success: false,
          message: `Process "${processName}" (PID: ${processId}) requires elevated permissions to terminate. Please run with administrator/sudo privileges.`,
        };
      }

      // Attempt to kill the process
      const killed = await this.platformAdapter.killProcess(processId, force);

      if (killed) {
        return {
          success: true,
          message: `Successfully terminated process "${processName}" (PID: ${processId}) on port ${port}`,
        };
      } else {
        return {
          success: false,
          message: `Failed to terminate process "${processName}" (PID: ${processId}). The process may have already exited or requires elevated permissions.`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error terminating process on port ${port}`,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Open a port in the default browser
   * @param port Port number
   * @param protocol Protocol to use (default: auto-detect based on port)
   * @returns Action result with success status and message
   */
  async openInBrowser(
    port: number,
    protocol?: "http" | "https"
  ): Promise<ActionResult> {
    try {
      // Validate port number
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        return {
          success: false,
          message: `Invalid port number: ${port}`,
        };
      }

      // Determine protocol if not specified
      const selectedProtocol = protocol || this.detectProtocol(port);

      // Construct URL
      const url = `${selectedProtocol}://localhost:${port}`;

      // Open in browser using Electron's shell
      await shell.openExternal(url);

      return {
        success: true,
        message: `Opened ${url} in default browser`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to open port ${port} in browser`,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Check if a port is available (not in use)
   * @param port Port number to check
   * @returns True if port is available, false if in use
   */
  async isPortAvailable(port: number): Promise<boolean> {
    try {
      const portInfo = await this.portScanner.getPortInfo(port);
      return portInfo === null;
    } catch (error) {
      // If we can't determine, assume unavailable for safety
      return false;
    }
  }

  /**
   * Detect protocol based on port number
   * Uses http for common dev ports (3000-9999), otherwise http as default
   * @param port Port number
   * @returns Protocol string
   */
  private detectProtocol(port: number): "http" | "https" {
    // Common HTTPS ports
    const httpsCommonPorts = [443, 8443, 9443];

    if (httpsCommonPorts.includes(port)) {
      return "https";
    }

    // For dev ports (3000-9999), default to http
    // Most development servers use http by default
    return "http";
  }
}
