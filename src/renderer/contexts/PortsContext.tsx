import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  PortsState,
  PortsActions,
  PortsContextValue,
  PortInfo,
  PortFilters,
} from "./types";
import { useNotifications } from "../services";
import {
  getPortsAPI,
  BROWSER_API_ERROR,
  isElectronRuntime,
} from "../utils/portsApi";

/**
 * Initial state for ports management
 */
const initialState: PortsState = {
  ports: [],
  selectedPort: null,
  filters: {
    search: "",
    portRange: null,
    protocol: "ALL",
  },
  isScanning: false,
  isMonitoring: false,
  error: null,
};

/**
 * Action types for state reducer
 */
type PortsAction =
  | { type: "SET_PORTS"; payload: PortInfo[] }
  | { type: "ADD_PORT"; payload: PortInfo }
  | { type: "REMOVE_PORT"; payload: PortInfo }
  | { type: "UPDATE_PORT"; payload: PortInfo }
  | { type: "SELECT_PORT"; payload: number | null }
  | { type: "SET_SEARCH_FILTER"; payload: string }
  | { type: "SET_PORT_RANGE_FILTER"; payload: [number, number] | null }
  | { type: "SET_PROTOCOL_FILTER"; payload: "TCP" | "UDP" | "ALL" }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_SCANNING"; payload: boolean }
  | { type: "SET_MONITORING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

/**
 * Reducer for ports state management
 */
function portsReducer(state: PortsState, action: PortsAction): PortsState {
  switch (action.type) {
    case "SET_PORTS":
      return { ...state, ports: action.payload, error: null };

    case "ADD_PORT": {
      // Check if port already exists
      const exists = state.ports.some((p) => p.port === action.payload.port);
      if (exists) {
        return state;
      }
      return { ...state, ports: [...state.ports, action.payload] };
    }

    case "REMOVE_PORT":
      return {
        ...state,
        ports: state.ports.filter((p) => p.port !== action.payload.port),
        selectedPort:
          state.selectedPort === action.payload.port
            ? null
            : state.selectedPort,
      };

    case "UPDATE_PORT": {
      const index = state.ports.findIndex(
        (p) => p.port === action.payload.port
      );
      if (index === -1) {
        return state;
      }
      const newPorts = [...state.ports];
      newPorts[index] = action.payload;
      return { ...state, ports: newPorts };
    }

    case "SELECT_PORT":
      return { ...state, selectedPort: action.payload };

    case "SET_SEARCH_FILTER":
      return {
        ...state,
        filters: { ...state.filters, search: action.payload },
      };

    case "SET_PORT_RANGE_FILTER":
      return {
        ...state,
        filters: { ...state.filters, portRange: action.payload },
      };

    case "SET_PROTOCOL_FILTER":
      return {
        ...state,
        filters: { ...state.filters, protocol: action.payload },
      };

    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: {
          search: "",
          portRange: null,
          protocol: "ALL",
        },
      };

    case "SET_SCANNING":
      return { ...state, isScanning: action.payload };

    case "SET_MONITORING":
      return { ...state, isMonitoring: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

/**
 * Filter ports based on current filters
 */
function filterPorts(ports: PortInfo[], filters: PortFilters): PortInfo[] {
  return ports.filter((port) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesPort = port.port.toString().includes(searchLower);
      const matchesProcess = port.processName
        .toLowerCase()
        .includes(searchLower);
      const matchesFramework = port.framework?.displayName
        .toLowerCase()
        .includes(searchLower);

      if (!matchesPort && !matchesProcess && !matchesFramework) {
        return false;
      }
    }

    // Port range filter
    if (filters.portRange) {
      const [start, end] = filters.portRange;
      if (port.port < start || port.port > end) {
        return false;
      }
    }

    // Protocol filter
    if (filters.protocol !== "ALL" && port.protocol !== filters.protocol) {
      return false;
    }

    return true;
  });
}

/**
 * Ports Context
 */
const PortsContext = createContext<PortsContextValue | undefined>(undefined);

/**
 * Ports Provider Component
 */
export const PortsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(portsReducer, initialState);
  const notifications = useNotifications();

  /**
   * Scan ports with optional range
   */
  const scanPorts = useCallback(
    async (range?: { start: number; end: number }) => {
      const portsAPI = getPortsAPI();
      dispatch({ type: "SET_SCANNING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const ports = await portsAPI.scanPorts(range);
        dispatch({ type: "SET_PORTS", payload: ports });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to scan ports";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        console.error("Error scanning ports:", error);

        // Show appropriate error notification
        if (
          errorMessage.toLowerCase().includes("permission") ||
          errorMessage.toLowerCase().includes("access denied")
        ) {
          notifications.showPermissionError("scan ports");
        } else if (
          errorMessage.toLowerCase().includes("command") ||
          errorMessage.toLowerCase().includes("platform")
        ) {
          notifications.showPlatformError(errorMessage, () => scanPorts(range));
        }
      } finally {
        dispatch({ type: "SET_SCANNING", payload: false });
      }
    },
    [notifications]
  );

  /**
   * Refresh ports (scan dev ports by default)
   */
  const refreshPorts = useCallback(async () => {
    await scanPorts({ start: 3000, end: 9999 });
  }, [scanPorts]);

  /**
   * Select a port
   */
  const selectPort = useCallback((port: number | null) => {
    dispatch({ type: "SELECT_PORT", payload: port });
  }, []);

  /**
   * Start monitoring ports
   */
  const startMonitoring = useCallback(
    async (interval: number = 5000) => {
      const portsAPI = getPortsAPI();
      try {
        const initialPorts = await portsAPI.startMonitoring(interval);
        dispatch({ type: "SET_PORTS", payload: initialPorts });
        dispatch({ type: "SET_MONITORING", payload: true });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to start monitoring";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        console.error("Error starting monitoring:", error);

        // Show appropriate error notification
        if (
          errorMessage.toLowerCase().includes("permission") ||
          errorMessage.toLowerCase().includes("access denied")
        ) {
          notifications.showPermissionError("start monitoring");
        } else if (
          errorMessage.toLowerCase().includes("command") ||
          errorMessage.toLowerCase().includes("platform")
        ) {
          notifications.showPlatformError(errorMessage, () =>
            startMonitoring(interval)
          );
        }
      }
    },
    [notifications]
  );

  /**
   * Stop monitoring ports
   */
  const stopMonitoring = useCallback(async () => {
    const portsAPI = getPortsAPI();
    try {
      await portsAPI.stopMonitoring();
      dispatch({ type: "SET_MONITORING", payload: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to stop monitoring";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      console.error("Error stopping monitoring:", error);

      // Show error notification
      notifications.showPlatformError(errorMessage);
    }
  }, [notifications]);

  /**
   * Set search filter
   */
  const setSearchFilter = useCallback((search: string) => {
    dispatch({ type: "SET_SEARCH_FILTER", payload: search });
  }, []);

  /**
   * Set port range filter
   */
  const setPortRangeFilter = useCallback((range: [number, number] | null) => {
    dispatch({ type: "SET_PORT_RANGE_FILTER", payload: range });
  }, []);

  /**
   * Set protocol filter
   */
  const setProtocolFilter = useCallback((protocol: "TCP" | "UDP" | "ALL") => {
    dispatch({ type: "SET_PROTOCOL_FILTER", payload: protocol });
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  /**
   * Kill process on a port
   */
  const killProcess = useCallback(async (port: number) => {
    const portsAPI = getPortsAPI();
    try {
      const result = await portsAPI.killProcess(port);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to kill process";
      return { success: false, message: errorMessage };
    }
  }, []);

  /**
   * Open port in browser
   */
  const openInBrowser = useCallback(
    async (port: number, protocol?: "http" | "https") => {
      const portsAPI = getPortsAPI();
      try {
        const result = await portsAPI.openInBrowser(port, protocol);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to open browser";
        return { success: false, message: errorMessage };
      }
    },
    []
  );

  /**
   * Set up event listeners for port changes
   */
  useEffect(() => {
    if (!isElectronRuntime()) {
      return;
    }

    const portsAPI = getPortsAPI();

    const unsubscribeAdded = portsAPI.onPortAdded((portInfo: PortInfo) => {
      dispatch({ type: "ADD_PORT", payload: portInfo });
    });

    const unsubscribeRemoved = portsAPI.onPortRemoved(
      (portInfo: PortInfo) => {
        dispatch({ type: "REMOVE_PORT", payload: portInfo });
      }
    );

    const unsubscribeUpdated = portsAPI.onPortUpdated(
      (portInfo: PortInfo) => {
        dispatch({ type: "UPDATE_PORT", payload: portInfo });
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeAdded();
      unsubscribeRemoved();
      unsubscribeUpdated();
    };
  }, []);

  /**
   * Warn when running outside Electron (e.g., direct Vite preview)
   */
  useEffect(() => {
    if (isElectronRuntime()) {
      return;
    }

    dispatch({ type: "SET_ERROR", payload: BROWSER_API_ERROR });
    notifications.showPlatformError(BROWSER_API_ERROR);
  }, [notifications]);

  /**
   * Actions object
   */
  const actions: PortsActions = useMemo(
    () => ({
      scanPorts,
      refreshPorts,
      selectPort,
      startMonitoring,
      stopMonitoring,
      setSearchFilter,
      setPortRangeFilter,
      setProtocolFilter,
      clearFilters,
      killProcess,
      openInBrowser,
    }),
    [
      scanPorts,
      refreshPorts,
      selectPort,
      startMonitoring,
      stopMonitoring,
      setSearchFilter,
      setPortRangeFilter,
      setProtocolFilter,
      clearFilters,
      killProcess,
      openInBrowser,
    ]
  );

  /**
   * Filtered ports based on current filters
   */
  const filteredPorts = useMemo(
    () => filterPorts(state.ports, state.filters),
    [state.ports, state.filters]
  );

  /**
   * Context value
   */
  const value: PortsContextValue = useMemo(
    () => ({
      state,
      actions,
      filteredPorts,
    }),
    [state, actions, filteredPorts]
  );

  return (
    <PortsContext.Provider value={value}>{children}</PortsContext.Provider>
  );
};

/**
 * Hook to use Ports Context
 */
export function usePortsManager(): PortsContextValue {
  const context = useContext(PortsContext);

  if (context === undefined) {
    throw new Error("usePortsManager must be used within a PortsProvider");
  }

  return context;
}
