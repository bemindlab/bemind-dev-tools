import React, { useEffect, useMemo } from "react";
import { PortsProvider, usePortsManager } from "./contexts";
import { PortsToolbar, PortsList, PortDetailsPanel } from "./components";
import { NotificationServiceProvider } from "./services";
import "./services/NotificationService.css";

const PortsManagerView: React.FC = () => {
  const { state, actions, filteredPorts } = usePortsManager();

  // Initialize monitoring on mount
  useEffect(() => {
    actions.startMonitoring(5000);
    actions.refreshPorts();

    return () => {
      actions.stopMonitoring();
    };
  }, [actions]);

  // Get selected port details
  const selectedPortInfo = useMemo(() => {
    if (state.selectedPort === null) return null;
    return state.ports.find((p) => p.port === state.selectedPort) || null;
  }, [state.selectedPort, state.ports]);

  const handleCloseDetails = () => {
    actions.selectPort(null);
  };

  return (
    <div className="ports-manager-view">
      <div className="ports-manager-header">
        <h1>Local Ports Manager</h1>
        <div className="status-info">
          {state.isMonitoring && (
            <span className="status-badge monitoring">● Monitoring</span>
          )}
          <span className="ports-count">
            {filteredPorts.length} of {state.ports.length} ports
          </span>
        </div>
      </div>

      <PortsToolbar />

      <div className="ports-manager-content">
        <PortsList
          ports={filteredPorts}
          selectedPort={state.selectedPort}
          onSelectPort={actions.selectPort}
          isLoading={state.isScanning}
        />

        {selectedPortInfo && (
          <PortDetailsPanel
            port={selectedPortInfo}
            onClose={handleCloseDetails}
          />
        )}
      </div>

      {state.error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {state.error}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NotificationServiceProvider>
      <PortsProvider>
        <PortsManagerView />
      </PortsProvider>
    </NotificationServiceProvider>
  );
};

export default App;
