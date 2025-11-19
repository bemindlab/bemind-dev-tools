/**
 * Types for Ports Context and State Management
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

export interface PortFilters {
  search: string;
  portRange: [number, number] | null;
  protocol: "TCP" | "UDP" | "ALL";
}

export interface PortsState {
  ports: PortInfo[];
  selectedPort: number | null;
  filters: PortFilters;
  isScanning: boolean;
  isMonitoring: boolean;
  error: string | null;
}

export interface PortsActions {
  // Port operations
  scanPorts: (range?: { start: number; end: number }) => Promise<void>;
  refreshPorts: () => Promise<void>;
  selectPort: (port: number | null) => void;

  // Monitoring
  startMonitoring: (interval?: number) => Promise<void>;
  stopMonitoring: () => Promise<void>;

  // Filters
  setSearchFilter: (search: string) => void;
  setPortRangeFilter: (range: [number, number] | null) => void;
  setProtocolFilter: (protocol: "TCP" | "UDP" | "ALL") => void;
  clearFilters: () => void;

  // Port actions
  killProcess: (
    port: number
  ) => Promise<{ success: boolean; message?: string }>;
  openInBrowser: (
    port: number,
    protocol?: "http" | "https"
  ) => Promise<{ success: boolean; message?: string }>;
}

export interface PortsContextValue {
  state: PortsState;
  actions: PortsActions;
  filteredPorts: PortInfo[];
}
