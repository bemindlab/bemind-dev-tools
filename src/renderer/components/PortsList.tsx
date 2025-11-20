import React, { useMemo } from "react";
import { List, RowComponentProps } from "react-window";
import { PortInfo } from "../contexts/types";
import { PortItem } from "./PortItem";
import "./PortsList.css";

interface PortsRowProps {
  ports: PortInfo[];
  selectedPort: number | null;
  onSelectPort: (port: number) => void;
}

const PortsRow = ({
  index,
  style,
  ariaAttributes,
  ports,
  selectedPort,
  onSelectPort,
}: RowComponentProps<PortsRowProps>): React.ReactElement => {
  const port = ports[index];
  if (!port) {
    return <div style={style} {...ariaAttributes} />;
  }

  return (
    <div
      style={{
        ...style,
        padding: "8px 12px",
        boxSizing: "border-box",
      }}
      {...ariaAttributes}
    >
      <PortItem
        port={port}
        isSelected={selectedPort === port.port}
        onSelect={() => onSelectPort(port.port)}
      />
    </div>
  );
};

interface PortsListProps {
  ports: PortInfo[];
  selectedPort: number | null;
  onSelectPort: (port: number) => void;
  isLoading?: boolean;
}

const ROW_HEIGHT = 96;

export const PortsList: React.FC<PortsListProps> = ({
  ports,
  selectedPort,
  onSelectPort,
  isLoading = false,
}) => {
  // Ensure row props object only changes when dependencies do
  const rowProps = useMemo(
    () => ({
      ports,
      selectedPort,
      onSelectPort,
    }),
    [ports, selectedPort, onSelectPort]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="ports-list-container">
        <div className="ports-list-loading">
          <div className="loading-spinner"></div>
          <p>Scanning ports...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (ports.length === 0) {
    return (
      <div className="ports-list-container">
        <div className="ports-list-empty">
          <div className="empty-icon">🔍</div>
          <h3>No ports found</h3>
          <p>No active ports detected in the current range.</p>
          <p className="empty-hint">
            Try adjusting your filters or refreshing the scan.
          </p>
        </div>
      </div>
    );
  }

  // Calculate list height (max 600px or window height - 200px)
  const listHeight = Math.min(600, window.innerHeight - 200);

  return (
    <div className="ports-list-container">
      <List
        className="ports-list"
        rowComponent={PortsRow}
        rowCount={ports.length}
        rowHeight={ROW_HEIGHT}
        rowProps={rowProps}
        style={{ height: listHeight, width: "100%" }}
      />
    </div>
  );
};
