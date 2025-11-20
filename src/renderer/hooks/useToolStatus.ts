import { useState, useEffect } from "react";
import { ToolStatus } from "../types/dashboard";
import { toolStatusManager } from "../services/ToolStatusManager";

/**
 * Hook to access tool statuses with reactive updates
 */
export function useToolStatuses(): Map<string, ToolStatus> {
  const [statuses, setStatuses] = useState<Map<string, ToolStatus>>(
    toolStatusManager.getAllStatuses()
  );

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = toolStatusManager.subscribe((updatedStatuses) => {
      setStatuses(updatedStatuses);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return statuses;
}

/**
 * Hook to access a specific tool's status with reactive updates
 */
export function useToolStatus(toolId: string): ToolStatus | undefined {
  const [status, setStatus] = useState<ToolStatus | undefined>(
    toolStatusManager.getStatus(toolId)
  );

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = toolStatusManager.subscribe((updatedStatuses) => {
      setStatus(updatedStatuses.get(toolId));
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [toolId]);

  return status;
}
