/**
 * ToolStateManager service manages tool state persistence
 * Handles saving/loading tool states to/from localStorage
 */

const STORAGE_KEY_PREFIX = "dev-tools-dashboard-tool-state-";

/**
 * ToolStateManager interface for managing tool state persistence
 */
export interface ToolStateManager {
  saveToolState(toolId: string, state: unknown): void;
  loadToolState(toolId: string): unknown | undefined;
  clearToolState(toolId: string): void;
  persistState(): Promise<void>;
  restoreState(): Promise<void>;
}

/**
 * ToolStateManager service implementation
 */
export class ToolStateManagerService implements ToolStateManager {
  private toolStates: Map<string, unknown>;

  constructor() {
    this.toolStates = new Map();
  }

  /**
   * Save tool state to memory
   */
  saveToolState(toolId: string, state: unknown): void {
    this.toolStates.set(toolId, state);
  }

  /**
   * Load tool state from memory
   */
  loadToolState(toolId: string): unknown | undefined {
    return this.toolStates.get(toolId);
  }

  /**
   * Clear tool state from memory and localStorage
   */
  clearToolState(toolId: string): void {
    this.toolStates.delete(toolId);
    // Also remove from localStorage
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${toolId}`);
    } catch (error) {
      console.warn(
        `Failed to remove tool state from localStorage for ${toolId}:`,
        error
      );
    }
  }

  /**
   * Persist all tool states to localStorage
   */
  async persistState(): Promise<void> {
    try {
      for (const [toolId, state] of this.toolStates.entries()) {
        try {
          const serialized = JSON.stringify(state);
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${toolId}`, serialized);
        } catch (serializationError) {
          console.warn(
            `Failed to serialize state for tool ${toolId}:`,
            serializationError
          );
          // Continue with other tools
        }
      }
    } catch (error) {
      console.warn("Failed to persist tool states:", error);
      throw error;
    }
  }

  /**
   * Restore all tool states from localStorage
   */
  async restoreState(): Promise<void> {
    try {
      // Find all tool state keys in localStorage
      const keys = Object.keys(localStorage);
      const toolStateKeys = keys.filter((key) =>
        key.startsWith(STORAGE_KEY_PREFIX)
      );

      for (const key of toolStateKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const toolId = key.substring(STORAGE_KEY_PREFIX.length);
            const state = JSON.parse(stored);
            this.toolStates.set(toolId, state);
          }
        } catch (parseError) {
          console.warn(`Failed to restore state for key ${key}:`, parseError);
          // Clear corrupted state
          localStorage.removeItem(key);
          // Continue with other tools
        }
      }
    } catch (error) {
      console.warn("Failed to restore tool states:", error);
      // Don't throw - gracefully degrade to empty state
      this.toolStates.clear();
    }
  }

  /**
   * Clear all tool states from memory and localStorage
   */
  clearAllStates(): void {
    // Clear from memory
    this.toolStates.clear();

    // Clear from localStorage
    try {
      const keys = Object.keys(localStorage);
      const toolStateKeys = keys.filter((key) =>
        key.startsWith(STORAGE_KEY_PREFIX)
      );
      for (const key of toolStateKeys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn("Failed to clear tool states from localStorage:", error);
    }
  }
}

// Export singleton instance
export const toolStateManager = new ToolStateManagerService();
