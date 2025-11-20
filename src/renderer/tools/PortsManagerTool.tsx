/**
 * Serializable state for Ports Manager tool
 */
export interface PortsManagerToolState {
  selectedPort: number | null;
  filters: {
    search: string;
    portRange: [number, number] | null;
    protocol: "TCP" | "UDP" | "ALL";
  };
  isMonitoring: boolean;
}

/**
 * Note: The PortsManagerTool component is defined in registerTools.ts
 * to avoid circular dependency issues during module loading.
 * This file only exports the type definition.
 */
