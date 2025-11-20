import React, { useEffect, useMemo, useRef } from "react";
import { toolRegistry } from "../services/ToolRegistry";
import type { ToolComponentProps } from "../types/dashboard";
import { PortsProvider, usePortsManager } from "../contexts";
import { PortsToolbar, PortsList, PortDetailsPanel } from "../components";
import { CookiesMonitorTool } from "./CookiesMonitorTool";
import { MemoryCacheMonitorTool } from "./MemoryCacheMonitorTool";

// Internal Ports Manager View component
const PortsManagerView: React.FC<{
  onStateChange?: (state: any) => void;
  initialState?: any;
}> = ({ onStateChange, initialState }) => {
  const { state, actions, filteredPorts } = usePortsManager();
  const {
    selectPort,
    setSearchFilter,
    setPortRangeFilter,
    setProtocolFilter,
    startMonitoring,
    stopMonitoring,
    refreshPorts,
  } = actions;

  const hasInitializedRef = useRef(false);

  // Initialize monitoring on mount
  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    // Restore initial state if provided
    if (initialState) {
      if (initialState.selectedPort !== null) {
        selectPort(initialState.selectedPort);
      }
      if (initialState.filters?.search) {
        setSearchFilter(initialState.filters.search);
      }
      if (initialState.filters?.portRange) {
        setPortRangeFilter(initialState.filters.portRange);
      }
      if (
        initialState.filters?.protocol &&
        initialState.filters.protocol !== "ALL"
      ) {
        setProtocolFilter(initialState.filters.protocol);
      }
    }

    // Start monitoring
    const shouldMonitor = initialState?.isMonitoring ?? true;
    if (shouldMonitor) {
      startMonitoring(5000);
    }

    return () => {
      stopMonitoring();
    };
  }, [
    initialState,
    selectPort,
    setSearchFilter,
    setPortRangeFilter,
    setProtocolFilter,
    startMonitoring,
    stopMonitoring,
    refreshPorts,
  ]);

  // Notify parent of state changes
  const onStateChangeRef = useRef(onStateChange);
  const lastEmittedState = useRef<string | null>(null);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    const callback = onStateChangeRef.current;
    if (!callback) return;

    const toolState = {
      selectedPort: state.selectedPort,
      filters: state.filters,
      isMonitoring: state.isMonitoring,
    };
    const serialized = JSON.stringify(toolState);

    if (serialized === lastEmittedState.current) {
      return;
    }

    lastEmittedState.current = serialized;
    callback(toolState);
  }, [state.selectedPort, state.filters, state.isMonitoring]);

  // Get selected port details
  const selectedPortInfo = useMemo(() => {
    if (state.selectedPort === null) return null;
    return state.ports.find((p) => p.port === state.selectedPort) || null;
  }, [state.selectedPort, state.ports]);

  const handleCloseDetails = () => {
    selectPort(null);
  };

  return React.createElement(
    "div",
    { className: "ports-manager-view" },
    React.createElement(
      "div",
      { className: "ports-manager-header" },
      React.createElement("h1", null, "Local Ports Manager"),
      React.createElement(
        "div",
        { className: "status-info" },
        state.isMonitoring &&
          React.createElement(
            "span",
            { className: "status-badge monitoring" },
            "● Monitoring"
          ),
        React.createElement(
          "span",
          { className: "ports-count" },
          `${filteredPorts.length} of ${state.ports.length} ports`
        )
      )
    ),
    React.createElement(PortsToolbar, null),
    React.createElement(
      "div",
      { className: "ports-manager-content" },
      React.createElement(PortsList, {
        ports: filteredPorts,
        selectedPort: state.selectedPort,
        onSelectPort: actions.selectPort,
        isLoading: state.isScanning,
      }),
      selectedPortInfo &&
        React.createElement(PortDetailsPanel, {
          port: selectedPortInfo,
          onClose: handleCloseDetails,
        })
    ),
    state.error &&
      React.createElement(
        "div",
        { className: "error-message" },
        React.createElement("span", { className: "error-icon" }, "⚠️"),
        state.error
      )
  );
};

// Define the component inline to avoid import issues
const PortsManagerTool: React.FC<ToolComponentProps> = ({
  isActive,
  onStateChange,
  initialState,
}) => {
  // Parse initial state if provided
  const parsedInitialState = useMemo(() => {
    if (!initialState) return undefined;
    try {
      return initialState;
    } catch (error) {
      console.error("Failed to parse Ports Manager initial state:", error);
      return undefined;
    }
  }, [initialState]);

  // Handle state changes
  const handleStateChange = (state: any) => {
    if (onStateChange) {
      onStateChange(state);
    }
  };

  // Preserve the initial state for the lifetime of this component instance
  const initialStateRef = useRef(parsedInitialState);
  const initialStateValue = initialStateRef.current;

  return React.createElement(
    PortsProvider,
    null,
    React.createElement(PortsManagerView, {
      onStateChange: handleStateChange,
      initialState: initialStateValue,
    })
  );
};

/**
 * Register all available tools in the dashboard
 */
export function registerAllTools(): void {
  // Ensure clean registration when StrictMode re-invokes initialization
  if (toolRegistry.getTool("ports-manager")) {
    toolRegistry.unregisterTool("ports-manager");
  }
  if (toolRegistry.getTool("cookies-monitor")) {
    toolRegistry.unregisterTool("cookies-monitor");
  }
  if (toolRegistry.getTool("memory-cache-monitor")) {
    toolRegistry.unregisterTool("memory-cache-monitor");
  }

  // Register Ports Manager
  toolRegistry.registerTool({
    id: "ports-manager",
    name: "Local Ports Manager",
    description: "Monitor and manage local development ports",
    icon: "🔌",
    category: ["networking", "monitoring", "development"],
    component: PortsManagerTool,
    features: [
      "Real-time port monitoring",
      "Kill processes on ports",
      "Open ports in browser",
      "Framework detection",
      "Search and filter ports",
    ],
    version: "1.0.0",
  });

  // Register Cookies Monitor
  toolRegistry.registerTool({
    id: "cookies-monitor",
    name: "Cookies Monitor",
    description: "View, manage, and export browser cookies",
    icon: "🍪",
    category: ["development", "debugging", "security"],
    component: CookiesMonitorTool,
    features: [
      "Real-time cookie monitoring",
      "Search and filter cookies",
      "View detailed cookie information",
      "Delete individual or all cookies",
      "Export cookies to JSON",
      "Security flag indicators",
    ],
    version: "1.0.0",
  });

  // Register Memory Cache Monitor
  toolRegistry.registerTool({
    id: "memory-cache-monitor",
    name: "Memory Cache Monitor",
    description: "Monitor system memory usage and top processes",
    icon: "🧠",
    category: ["monitoring", "performance", "development"],
    component: MemoryCacheMonitorTool,
    features: [
      "Real-time memory metrics",
      "Visual memory gauge",
      "Top memory-consuming processes",
      "Configurable refresh interval",
      "Pause/resume monitoring",
    ],
    version: "1.0.0",
  });
}
