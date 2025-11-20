import { ToolStatus } from "../types/dashboard";

/**
 * ToolStatusManager manages the status of tools in the dashboard
 * Provides reactive updates when tool statuses change
 */
export class ToolStatusManager {
  private statuses: Map<string, ToolStatus> = new Map();
  private listeners: Set<(statuses: Map<string, ToolStatus>) => void> =
    new Set();

  /**
   * Set the status for a tool
   */
  setStatus(toolId: string, status: Omit<ToolStatus, "toolId">): void {
    const fullStatus: ToolStatus = {
      toolId,
      ...status,
      lastUpdated: Date.now(),
    };

    this.statuses.set(toolId, fullStatus);
    this.notifyListeners();
  }

  /**
   * Get the status for a tool
   */
  getStatus(toolId: string): ToolStatus | undefined {
    return this.statuses.get(toolId);
  }

  /**
   * Get all tool statuses
   */
  getAllStatuses(): Map<string, ToolStatus> {
    return new Map(this.statuses);
  }

  /**
   * Clear the status for a tool
   */
  clearStatus(toolId: string): void {
    this.statuses.delete(toolId);
    this.notifyListeners();
  }

  /**
   * Clear all statuses
   */
  clearAllStatuses(): void {
    this.statuses.clear();
    this.notifyListeners();
  }

  /**
   * Subscribe to status changes
   * Returns an unsubscribe function
   */
  subscribe(listener: (statuses: Map<string, ToolStatus>) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(): void {
    const statusesCopy = this.getAllStatuses();
    this.listeners.forEach((listener) => {
      listener(statusesCopy);
    });
  }

  /**
   * Get the count of tools with a specific status state
   */
  getStatusCount(state: ToolStatus["state"]): number {
    return Array.from(this.statuses.values()).filter(
      (status) => status.state === state
    ).length;
  }

  /**
   * Check if a tool has a specific status state
   */
  hasStatus(toolId: string, state: ToolStatus["state"]): boolean {
    const status = this.statuses.get(toolId);
    return status?.state === state;
  }
}

// Export a singleton instance
export const toolStatusManager = new ToolStatusManager();
