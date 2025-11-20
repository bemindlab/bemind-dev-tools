import { EventEmitter } from "events";
import { PortScannerService } from "./PortScannerService";
import { PortInfo } from "./platform/types";

/**
 * Events emitted by ProcessMonitor
 */
export interface ProcessMonitorEvents {
  "port-added": (port: PortInfo) => void;
  "port-removed": (port: PortInfo) => void;
  "port-updated": (port: PortInfo) => void;
}

/**
 * Process Monitor
 *
 * Tracks changes in port states and emits events for real-time updates
 */
export class ProcessMonitor extends EventEmitter {
  private portScanner: PortScannerService;
  private currentPorts: Map<string, PortInfo>;
  private monitoringInterval: NodeJS.Timeout | null;
  private intervalMs: number;
  private isMonitoring: boolean;

  /**
   * Create a new ProcessMonitor
   * @param portScanner PortScannerService instance to use for scanning
   */
  constructor(portScanner: PortScannerService) {
    super();
    this.portScanner = portScanner;
    this.currentPorts = new Map();
    this.monitoringInterval = null;
    this.intervalMs = 5000; // Default 5 seconds
    this.isMonitoring = false;
  }

  /**
   * Start monitoring with specified interval
   * @param intervalMs Monitoring interval in milliseconds (default: 5000)
   */
  async start(intervalMs: number = 5000): Promise<PortInfo[]> {
    if (this.isMonitoring) {
      console.warn("ProcessMonitor is already running");
      return this.getCurrentPorts();
    }

    this.intervalMs = intervalMs;
    this.isMonitoring = true;

    // Perform initial scan
    await this.scan();

    // Set up periodic scanning
    this.monitoringInterval = setInterval(() => {
      this.scan().catch((error) => {
        console.error("Port scan failed:", error);
      });
    }, this.intervalMs);

    console.log(`ProcessMonitor started with interval: ${intervalMs}ms`);
    return this.getCurrentPorts();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isMonitoring) {
      console.warn("ProcessMonitor is not running");
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    console.log("ProcessMonitor stopped");
  }

  /**
   * Get current snapshot of ports
   * @returns Array of current PortInfo
   */
  getCurrentPorts(): PortInfo[] {
    return Array.from(this.currentPorts.values());
  }

  /**
   * Check if monitoring is active
   * @returns True if monitoring is active
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Clear all resources and stop monitoring
   */
  cleanup(): void {
    this.stop();
    this.currentPorts.clear();
    this.removeAllListeners();
  }

  /**
   * Perform a port scan and detect changes
   */
  private async scan(): Promise<void> {
    try {
      // Scan development ports
      const scannedPorts = await this.portScanner.scanDevPorts();

      // Create a map of new ports for efficient lookup
      const newPortsMap = new Map<string, PortInfo>();
      for (const port of scannedPorts) {
        const key = this.getPortKey(port);
        newPortsMap.set(key, port);
      }

      // Detect changes using diff algorithm
      this.detectChanges(newPortsMap);

      // Update current snapshot
      this.currentPorts = newPortsMap;
    } catch (error) {
      console.error("Error during port scan:", error);
      throw error;
    }
  }

  /**
   * Detect changes between current and new port snapshots
   * @param newPorts Map of newly scanned ports
   */
  private detectChanges(newPorts: Map<string, PortInfo>): void {
    // Detect removed ports
    for (const [key, oldPort] of this.currentPorts.entries()) {
      if (!newPorts.has(key)) {
        this.emit("port-removed", oldPort);
      }
    }

    // Detect added and updated ports
    for (const [key, newPort] of newPorts.entries()) {
      const oldPort = this.currentPorts.get(key);

      if (!oldPort) {
        // Port was added
        this.emit("port-added", newPort);
      } else if (this.hasPortChanged(oldPort, newPort)) {
        // Port was updated
        this.emit("port-updated", newPort);
      }
    }
  }

  /**
   * Generate a unique key for a port
   * @param port PortInfo object
   * @returns Unique key string
   */
  private getPortKey(port: PortInfo): string {
    // Use port number, protocol, and PID as unique identifier
    return `${port.port}-${port.protocol}-${port.processId}`;
  }

  /**
   * Check if a port has changed
   * @param oldPort Previous port state
   * @param newPort New port state
   * @returns True if port has changed
   */
  private hasPortChanged(oldPort: PortInfo, newPort: PortInfo): boolean {
    // Compare relevant fields that might change
    return (
      oldPort.state !== newPort.state ||
      oldPort.processName !== newPort.processName ||
      oldPort.commandLine !== newPort.commandLine ||
      oldPort.localAddress !== newPort.localAddress ||
      oldPort.remoteAddress !== newPort.remoteAddress
    );
  }
}
