/**
 * Types for Platform Adapter
 */

export interface FrameworkInfo {
  name: string;
  displayName: string;
  icon?: string;
  color?: string;
}

export interface PortInfo {
  port: number;
  protocol: "TCP" | "UDP";
  processId: number;
  processName: string;
  commandLine: string;
  state: string;
  localAddress?: string;
  remoteAddress?: string;
  framework?: FrameworkInfo;
}

export interface PlatformAdapter {
  /**
   * Get command to list active ports
   */
  getPortListCommand(startPort?: number, endPort?: number): string;

  /**
   * Parse platform-specific output into PortInfo array
   */
  parsePortOutput(output: string): PortInfo[];

  /**
   * Kill process by PID
   */
  killProcess(pid: number, force?: boolean): Promise<boolean>;

  /**
   * Check if process requires elevated permissions
   */
  requiresElevation(pid: number): Promise<boolean>;
}
