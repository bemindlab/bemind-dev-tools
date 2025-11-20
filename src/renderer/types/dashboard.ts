import { ComponentType } from "react";

/**
 * Props passed to all tool components
 */
export interface ToolComponentProps {
  isActive: boolean;
  onStateChange?: (state: unknown) => void;
  initialState?: unknown;
}

/**
 * Tool metadata and configuration
 */
export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string[];
  component: ComponentType<ToolComponentProps>;
  features?: string[];
  version?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Tool status information
 */
export interface ToolStatus {
  toolId: string;
  state: "idle" | "active" | "warning" | "error";
  message?: string;
  notificationCount?: number;
  lastUpdated: number;
}

/**
 * Category information
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

/**
 * Navigation state
 */
export interface NavigationState {
  currentView: "home" | "tool";
  activeToolId: string | null;
  history: NavigationHistoryEntry[];
  transitionInProgress: boolean;
}

export interface NavigationHistoryEntry {
  view: "home" | "tool";
  toolId?: string;
  timestamp: number;
}

/**
 * User preferences
 */
export interface UserPreferences {
  pinnedTools: string[];
  recentlyUsedTools: RecentTool[];
  enableTransitions: boolean;
  reducedMotion: boolean;
  lastActiveToolId?: string;
  searchHistory?: string[];
}

export interface RecentTool {
  toolId: string;
  lastAccessedAt: number;
}
