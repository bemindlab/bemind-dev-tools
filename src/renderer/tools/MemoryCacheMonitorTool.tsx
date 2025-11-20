import React, { useEffect, useRef, useState, useCallback } from "react";
import type { ToolComponentProps } from "../types/dashboard";
import { memoryApi } from "../utils/memoryApi";
import type { MemoryMetrics, ProcessMemoryInfo } from "../../preload/preload";
import { MemoryGauge, ProcessList, RefreshControls } from "../components";
import "./MemoryCacheMonitorTool.css";

export interface MemoryCacheMonitorState {
  refreshInterval: number;
  isPaused: boolean;
}

export const MemoryCacheMonitorTool: React.FC<ToolComponentProps> = ({
  isActive,
  onStateChange,
  initialState,
}) => {
  const parsedInitialState = initialState as MemoryCacheMonitorState | undefined;

  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null);
  const [processes, setProcesses] = useState<ProcessMemoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(
    parsedInitialState?.refreshInterval || 3
  );
  const [isPaused, setIsPaused] = useState<boolean>(
    parsedInitialState?.isPaused || false
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);
  const onStateChangeRef = useRef(onStateChange);
  const lastEmittedState = useRef<string | null>(null);

  // Keep onStateChange ref updated
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  const fetchData = useCallback(async () => {
    try {
      const [metricsData, processesData] = await Promise.all([
        memoryApi.getMetrics(),
        memoryApi.getTopProcesses(5),
      ]);

      setMetrics(metricsData);
      setProcesses(processesData);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to fetch memory data: ${errorMessage}`);
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchData();
    }
  }, [fetchData]);

  // Handle refresh interval and pause state
  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    fetchData();
    intervalRef.current = setInterval(fetchData, refreshInterval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, refreshInterval, fetchData]);

  // Notify parent of state changes
  useEffect(() => {
    const callback = onStateChangeRef.current;
    if (!callback) return;

    const toolState = {
      refreshInterval,
      isPaused,
    };
    const serialized = JSON.stringify(toolState);

    if (serialized === lastEmittedState.current) {
      return;
    }

    lastEmittedState.current = serialized;
    callback(toolState);
  }, [refreshInterval, isPaused]);

  const handleIntervalChange = (newInterval: number) => {
    setRefreshInterval(newInterval);
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className="memory-cache-monitor-tool">
      <div className="monitor-header">
        <h1>Memory Cache Monitor</h1>
        <p className="monitor-description">
          Real-time system memory usage and top memory-consuming processes
        </p>
      </div>

      <RefreshControls
        refreshInterval={refreshInterval}
        isPaused={isPaused}
        onIntervalChange={handleIntervalChange}
        onTogglePause={handleTogglePause}
      />

      <div className="monitor-content">
        <div className="monitor-section">
          <h2>System Memory</h2>
          <MemoryGauge metrics={metrics} isLoading={isLoading} />
        </div>

        <div className="monitor-section">
          <h2>Top Processes</h2>
          <ProcessList processes={processes} isLoading={isLoading} />
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};
