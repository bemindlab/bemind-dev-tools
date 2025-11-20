import { UserPreferences, RecentTool } from "../types/dashboard";

const STORAGE_KEY = "dev-tools-dashboard-preferences";
const MAX_PINNED_TOOLS = 6;
const MAX_RECENT_TOOLS = 3;

/**
 * UserPreferences service manages user preferences with localStorage persistence
 */
export class UserPreferencesService {
  private preferences: UserPreferences;

  constructor() {
    this.preferences = this.getDefaultPreferences();
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      pinnedTools: [],
      recentlyUsedTools: [],
      enableTransitions: true,
      reducedMotion: false,
    };
  }

  /**
   * Get current preferences
   */
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Pin a tool
   * @throws Error if pin limit is exceeded
   */
  pinTool(toolId: string): void {
    if (this.preferences.pinnedTools.includes(toolId)) {
      return; // Already pinned
    }

    if (this.preferences.pinnedTools.length >= MAX_PINNED_TOOLS) {
      throw new Error(
        `Maximum ${MAX_PINNED_TOOLS} pinned tools. Unpin one first.`
      );
    }

    this.preferences.pinnedTools.push(toolId);
  }

  /**
   * Unpin a tool
   */
  unpinTool(toolId: string): void {
    this.preferences.pinnedTools = this.preferences.pinnedTools.filter(
      (id) => id !== toolId
    );
  }

  /**
   * Check if a tool is pinned
   */
  isToolPinned(toolId: string): boolean {
    return this.preferences.pinnedTools.includes(toolId);
  }

  /**
   * Get pinned tools
   */
  getPinnedTools(): string[] {
    return [...this.preferences.pinnedTools];
  }

  /**
   * Add a tool to recently used
   */
  addRecentlyUsed(toolId: string): void {
    // Remove if already exists
    this.preferences.recentlyUsedTools =
      this.preferences.recentlyUsedTools.filter(
        (tool) => tool.toolId !== toolId
      );

    // Add to front
    this.preferences.recentlyUsedTools.unshift({
      toolId,
      lastAccessedAt: Date.now(),
    });

    // Keep only max recent tools
    if (this.preferences.recentlyUsedTools.length > MAX_RECENT_TOOLS) {
      this.preferences.recentlyUsedTools =
        this.preferences.recentlyUsedTools.slice(0, MAX_RECENT_TOOLS);
    }
  }

  /**
   * Get recently used tools
   */
  getRecentlyUsedTools(): RecentTool[] {
    return [...this.preferences.recentlyUsedTools];
  }

  /**
   * Clear recently used history
   */
  clearRecentlyUsed(): void {
    this.preferences.recentlyUsedTools = [];
  }

  /**
   * Set reduced motion preference
   */
  setReducedMotion(enabled: boolean): void {
    this.preferences.reducedMotion = enabled;
  }

  /**
   * Set transitions enabled
   */
  setTransitionsEnabled(enabled: boolean): void {
    this.preferences.enableTransitions = enabled;
  }

  /**
   * Persist preferences to localStorage
   */
  async persist(): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.warn("Failed to persist preferences:", error);
      throw error;
    }
  }

  /**
   * Restore preferences from localStorage
   */
  async restore(): Promise<void> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.preferences = {
          ...this.getDefaultPreferences(),
          ...parsed,
        };
      }
    } catch (error) {
      console.warn("Failed to restore preferences:", error);
      this.preferences = this.getDefaultPreferences();
    }
  }

  /**
   * Clear all preferences
   */
  clear(): void {
    this.preferences = this.getDefaultPreferences();
  }
}

// Export singleton instance
export const userPreferencesService = new UserPreferencesService();
