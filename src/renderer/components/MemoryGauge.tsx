import React from "react";
import { formatBytes } from "../utils/formatUtils";
import type { MemoryMetrics } from "../../preload/preload";
import "./MemoryGauge.css";

interface MemoryGaugeProps {
  metrics: MemoryMetrics | null;
  isLoading: boolean;
}

export const MemoryGauge: React.FC<MemoryGaugeProps> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) {
    return (
      <div className="memory-gauge loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const getStatusClass = (percentage: number): string => {
    if (percentage >= 95) return "critical";
    if (percentage >= 80) return "warning";
    return "normal";
  };

  const statusClass = getStatusClass(metrics.percentage);

  return (
    <div className={`memory-gauge ${statusClass}`}>
      <div className="gauge-container">
        <svg className="gauge-svg" viewBox="0 0 200 200" width="200" height="200">
          <circle
            className="gauge-background"
            cx="100"
            cy="100"
            r="85"
            fill="none"
            strokeWidth="15"
          />
          <circle
            className="gauge-fill"
            cx="100"
            cy="100"
            r="85"
            fill="none"
            strokeWidth="15"
            strokeDasharray={`${(metrics.percentage / 100) * 534.07} 534.07`}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="gauge-text">
          <span className="gauge-percentage">{metrics.percentage.toFixed(1)}%</span>
          <span className="gauge-label">Used</span>
        </div>
      </div>

      <div className="memory-stats">
        <div className="memory-stat">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{formatBytes(metrics.total)}</span>
        </div>
        <div className="memory-stat">
          <span className="stat-label">Used:</span>
          <span className="stat-value">{formatBytes(metrics.used)}</span>
        </div>
        <div className="memory-stat">
          <span className="stat-label">Available:</span>
          <span className="stat-value">{formatBytes(metrics.available)}</span>
        </div>
      </div>
    </div>
  );
};
