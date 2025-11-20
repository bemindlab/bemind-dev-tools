import type { MemoryAPI, MemoryMetrics, ProcessMemoryInfo } from "../../preload/preload";

/**
 * Memory API wrapper for renderer process
 */
export const memoryApi: MemoryAPI = {
  getMetrics: async (): Promise<MemoryMetrics> => {
    if (!window.memoryAPI) {
      throw new Error("Memory API is not available");
    }
    return window.memoryAPI.getMetrics();
  },

  getTopProcesses: async (limit?: number): Promise<ProcessMemoryInfo[]> => {
    if (!window.memoryAPI) {
      throw new Error("Memory API is not available");
    }
    return window.memoryAPI.getTopProcesses(limit);
  },
};
