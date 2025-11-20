import React from "react";
import { formatBytes } from "../utils/formatUtils";
import type { ProcessMemoryInfo } from "../../preload/preload";
import "./ProcessList.css";

interface ProcessListProps {
  processes: ProcessMemoryInfo[];
  isLoading: boolean;
}

export const ProcessList: React.FC<ProcessListProps> = ({ processes, isLoading }) => {
  if (isLoading) {
    return (
      <div className="process-list loading">
        <h3>Top Memory Processes</h3>
        <div className="loading-message">Loading processes...</div>
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <div className="process-list empty">
        <h3>Top Memory Processes</h3>
        <div className="empty-message">No processes found</div>
      </div>
    );
  }

  return (
    <div className="process-list">
      <h3>Top Memory Processes</h3>
      <div className="process-table">
        <div className="process-header">
          <span className="header-name">Process</span>
          <span className="header-pid">PID</span>
          <span className="header-memory">Memory</span>
        </div>
        <div className="process-items">
          {processes.map((process) => (
            <div key={process.pid} className="process-item">
              <span className="process-name" title={process.name}>
                {process.name}
              </span>
              <span className="process-pid">{process.pid}</span>
              <span className="process-memory">{formatBytes(process.memory)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
