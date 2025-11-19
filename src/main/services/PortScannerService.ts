import { exec } from "child_process";
import { promisify } from "util";
import { PlatformAdapterFactory } from "./platform/PlatformAdapterFactory";
import { PortInfo } from "./platform/types";

const execAsync = promisify(exec);

/**
 * Cache entry for port scan results
 */
interface CacheEntry {
  data: PortInfo[];
  timestamp: number;
}

/**
 * Port Scanner Service
 *
 * Detects active ports and extracts process information using platform-specific commands
 */
export class PortScannerService {
  private platformAdapter = PlatformAdapterFactory.getAdapter();
  private cache = new Map<string, CacheEntry>();
  private readonly cacheTTL: number;

  /**
   * Create a new PortScannerService
   * @param cacheTTL Cache time-to-live in milliseconds (default: 3000ms)
   */
  constructor(cacheTTL: number = 3000) {
    this.cacheTTL = cacheTTL;
  }

  /**
   * Scan ports in specified range
   * @param startPort Starting port number (default: 1024)
   * @param endPort Ending port number (default: 65535)
   * @returns Array of active port information
   * @throws Error if port range is invalid
   */
  async scanPorts(
    startPort: number = 1024,
    endPort: number = 65535
  ): Promise<PortInfo[]> {
    // Validate port range
    this.validatePortRange(startPort, endPort);

    // Check cache
    const cacheKey = `${startPort}-${endPort}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get platform-specific command
      const command = this.platformAdapter.getPortListCommand(
        startPort,
        endPort
      );

      // Execute command
      const { stdout } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer for large outputs
      });

      // Parse output into PortInfo objects
      const ports = this.platformAdapter.parsePortOutput(stdout);

      // Filter by port range
      const filteredPorts = ports.filter(
        (port) => port.port >= startPort && port.port <= endPort
      );

      // Cache results
      this.setCache(cacheKey, filteredPorts);

      return filteredPorts;
    } catch (error) {
      throw this.handleCommandError(error);
    }
  }

  /**
   * Scan common development ports (3000-9999)
   * @returns Array of active port information
   */
  async scanDevPorts(): Promise<PortInfo[]> {
    return this.scanPorts(3000, 9999);
  }

  /**
   * Get information for a specific port
   * @param port Port number to query
   * @returns Port information or null if not found
   */
  async getPortInfo(port: number): Promise<PortInfo | null> {
    this.validatePort(port);

    try {
      const command = this.platformAdapter.getPortListCommand();
      const { stdout } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10,
      });

      const ports = this.platformAdapter.parsePortOutput(stdout);
      return ports.find((p) => p.port === port) || null;
    } catch (error) {
      throw this.handleCommandError(error);
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Validate port range
   * @param startPort Starting port number
   * @param endPort Ending port number
   * @throws Error if range is invalid
   */
  private validatePortRange(startPort: number, endPort: number): void {
    if (!Number.isInteger(startPort) || !Number.isInteger(endPort)) {
      throw new Error("Port numbers must be integers");
    }

    if (startPort < 1024 || startPort > 65535) {
      throw new Error("Start port must be between 1024 and 65535");
    }

    if (endPort < 1024 || endPort > 65535) {
      throw new Error("End port must be between 1024 and 65535");
    }

    if (startPort > endPort) {
      throw new Error("Start port must be less than or equal to end port");
    }
  }

  /**
   * Validate a single port number
   * @param port Port number to validate
   * @throws Error if port is invalid
   */
  private validatePort(port: number): void {
    if (!Number.isInteger(port)) {
      throw new Error("Port number must be an integer");
    }

    if (port < 1024 || port > 65535) {
      throw new Error("Port must be between 1024 and 65535");
    }
  }

  /**
   * Get data from cache if not expired
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  private getFromCache(key: string): PortInfo[] | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store data in cache
   * @param key Cache key
   * @param data Data to cache
   */
  private setCache(key: string, data: PortInfo[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle command execution errors
   * @param error Error from command execution
   * @returns Formatted error
   */
  private handleCommandError(error: any): Error {
    if (error.code === "ENOENT") {
      return new Error(
        `Required system command not found. Platform: ${PlatformAdapterFactory.getPlatformName()}`
      );
    }

    if (error.code === "EACCES" || error.code === "EPERM") {
      return new Error(
        "Permission denied. Try running with elevated permissions."
      );
    }

    if (error.killed || error.signal) {
      return new Error(
        `Command execution was terminated (signal: ${error.signal})`
      );
    }

    if (error.stderr) {
      return new Error(`Command failed: ${error.stderr}`);
    }

    return new Error(
      `Port scanning failed: ${error.message || "Unknown error"}`
    );
  }
}
