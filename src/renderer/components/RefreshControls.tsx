import React from "react";
import "./RefreshControls.css";

interface RefreshControlsProps {
  refreshInterval: number;
  isPaused: boolean;
  onIntervalChange: (interval: number) => void;
  onTogglePause: () => void;
}

export const RefreshControls: React.FC<RefreshControlsProps> = ({
  refreshInterval,
  isPaused,
  onIntervalChange,
  onTogglePause,
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onIntervalChange(value);
  };

  return (
    <div className="refresh-controls">
      <div className="control-group">
        <label htmlFor="refresh-interval" className="control-label">
          Refresh Interval: <span className="interval-value">{refreshInterval}s</span>
        </label>
        <input
          id="refresh-interval"
          type="range"
          min="1"
          max="10"
          step="1"
          value={refreshInterval}
          onChange={handleSliderChange}
          disabled={isPaused}
          className="interval-slider"
        />
      </div>

      <button
        onClick={onTogglePause}
        className={`pause-button ${isPaused ? "paused" : "active"}`}
      >
        {isPaused ? "▶ Resume" : "⏸ Pause"}
      </button>

      <div className="status-indicator">
        <span className={`status-dot ${isPaused ? "paused" : "active"}`}></span>
        <span className="status-text">{isPaused ? "Paused" : "Active"}</span>
      </div>
    </div>
  );
};
