/**
 * Platform Adapter Module
 *
 * Provides cross-platform port detection and process management
 */

export type { PlatformAdapter, PortInfo, FrameworkInfo } from "./types";
export { MacOSAdapter } from "./MacOSAdapter";
export { WindowsAdapter } from "./WindowsAdapter";
export { LinuxAdapter } from "./LinuxAdapter";
export { PlatformAdapterFactory } from "./PlatformAdapterFactory";
