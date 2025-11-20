import React, { useEffect, useMemo, useState, useCallback } from "react";
import { PortsProvider } from "./contexts";
import {
  HomePage,
  NavigationRouter,
  BreadcrumbNavigation,
  ErrorBoundary,
  Footer,
} from "./components";
import { NotificationServiceProvider, useNotifications } from "./services";
import {
  NavigationProvider,
  useNavigation,
} from "./contexts/NavigationContext";
import { toolRegistry } from "./services/ToolRegistry";
import { userPreferencesService } from "./services/UserPreferences";
import { toolStateManager } from "./services/ToolStateManager";
import { registerAllTools } from "./tools/registerTools";
import "./services/NotificationService.css";
import packageInfo from "../../package.json";

const DashboardAppContent: React.FC = () => {
  const { state, navigateToHome, navigateToTool, transitionsEnabled } =
    useNavigation();
  const notifications = useNotifications();
  const [pinnedToolIds, setPinnedToolIds] = useState<string[]>([]);
  const [recentlyUsedToolIds, setRecentlyUsedToolIds] = useState<string[]>([]);
  const [toolStates, setToolStates] = useState<Map<string, unknown>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on mount: register tools, restore preferences and states
  useEffect(() => {
    const initialize = async () => {
      try {
        // Register all available tools
        registerAllTools();
        console.log("Tools registered:", toolRegistry.getAllTools());

        // Restore user preferences
        await userPreferencesService.restore();
        const preferences = userPreferencesService.getPreferences();
        setPinnedToolIds(preferences.pinnedTools);
        setRecentlyUsedToolIds(
          preferences.recentlyUsedTools.map((tool) => tool.toolId)
        );

        // Restore tool states
        await toolStateManager.restoreState();

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize dashboard:", error);
        // Continue with defaults
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // Persist preferences when they change
  useEffect(() => {
    if (!isInitialized) return;

    const persist = async () => {
      try {
        await userPreferencesService.persist();
      } catch (error) {
        console.warn("Failed to persist preferences:", error);
        notifications.show({
          type: "warning",
          title: "Preferences Not Saved",
          message:
            "Your preferences couldn't be saved. They will be lost when you close the app.",
          duration: 4000,
        });
      }
    };

    persist();
  }, [pinnedToolIds, recentlyUsedToolIds, isInitialized, notifications]);

  // Persist tool states when they change
  useEffect(() => {
    if (!isInitialized) return;

    const persist = async () => {
      try {
        await toolStateManager.persistState();
      } catch (error) {
        console.warn("Failed to persist tool states:", error);
        notifications.show({
          type: "warning",
          title: "Tool State Not Saved",
          message:
            "Your tool state couldn't be saved. Changes will be lost when you close the app.",
          duration: 4000,
        });
      }
    };

    persist();
  }, [toolStates, isInitialized, notifications]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl+H to navigate home
      if ((event.metaKey || event.ctrlKey) && event.key === "h") {
        event.preventDefault();
        navigateToHome();
      }
      // Escape to navigate home from tool view
      else if (event.key === "Escape" && state.currentView === "tool") {
        event.preventDefault();
        navigateToHome();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateToHome, state.currentView]);

  const handleToolSelect = useCallback(
    (toolId: string) => {
      navigateToTool(toolId);

      // Add to recently used
      userPreferencesService.addRecentlyUsed(toolId);
      const recentTools = userPreferencesService.getRecentlyUsedTools();
      setRecentlyUsedToolIds(recentTools.map((tool) => tool.toolId));
    },
    [navigateToTool]
  );

  const handleToolPin = useCallback(
    (toolId: string) => {
      try {
        userPreferencesService.pinTool(toolId);
        setPinnedToolIds(userPreferencesService.getPinnedTools());
      } catch (error) {
        console.error("Failed to pin tool:", error);
        notifications.show({
          type: "warning",
          title: "Cannot Pin Tool",
          message:
            error instanceof Error
              ? error.message
              : "Maximum 6 pinned tools. Unpin one first.",
          duration: 3000,
        });
      }
    },
    [notifications]
  );

  const handleToolUnpin = useCallback((toolId: string) => {
    userPreferencesService.unpinTool(toolId);
    setPinnedToolIds(userPreferencesService.getPinnedTools());
  }, []);

  const handleClearRecentlyUsed = useCallback(() => {
    userPreferencesService.clearRecentlyUsed();
    setRecentlyUsedToolIds([]);
  }, []);

  const handleToolStateChange = useCallback(
    (toolId: string, state: unknown) => {
      toolStateManager.saveToolState(toolId, state);
      setToolStates(new Map(toolStateManager["toolStates"]));
    },
    []
  );

  // Get all tools from registry
  const tools = useMemo(() => {
    const allTools = toolRegistry.getAllTools();
    console.log("Tools from registry:", allTools);
    return allTools;
  }, [isInitialized]);

  const activeTool = useMemo(() => {
    if (!state.activeToolId) return null;
    return toolRegistry.getTool(state.activeToolId) || null;
  }, [state.activeToolId]);

  // Handle invalid tool navigation
  useEffect(() => {
    if (state.activeToolId && !activeTool) {
      console.error(`Invalid tool ID: ${state.activeToolId}`);
      notifications.show({
        type: "error",
        title: "Tool Not Found",
        message: `The tool "${state.activeToolId}" could not be found. Returning to home.`,
        duration: 3000,
      });
      navigateToHome();
    }
  }, [state.activeToolId, activeTool, navigateToHome, notifications]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  const homeView = (
    <HomePage
      tools={tools}
      pinnedToolIds={pinnedToolIds}
      recentlyUsedToolIds={recentlyUsedToolIds}
      onToolSelect={handleToolSelect}
      onToolPin={handleToolPin}
      onToolUnpin={handleToolUnpin}
      onClearRecentlyUsed={handleClearRecentlyUsed}
    />
  );

  const toolView = activeTool ? (
    <div className="tool-view-wrapper">
      <BreadcrumbNavigation
        currentView="tool"
        toolName={activeTool.name}
        onNavigateHome={navigateToHome}
      />
      <ErrorBoundary
        onNavigateHome={navigateToHome}
        fallbackMessage="This tool encountered an error. You can return to home and try again."
      >
        <activeTool.component
          isActive={true}
          initialState={toolStateManager.loadToolState(activeTool.id)}
          onStateChange={(state: unknown) =>
            handleToolStateChange(activeTool.id, state)
          }
        />
      </ErrorBoundary>
    </div>
  ) : null;

  return (
    <div className="app">
      <NavigationRouter homeView={homeView} toolView={toolView} />
      <Footer version={packageInfo.version} />
    </div>
  );
};

const DashboardApp: React.FC = () => {
  // Get user preferences for transitions
  const [reducedMotion, setReducedMotion] = useState(false);
  const [enableTransitions, setEnableTransitions] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      await userPreferencesService.restore();
      const prefs = userPreferencesService.getPreferences();
      setReducedMotion(prefs.reducedMotion);
      setEnableTransitions(prefs.enableTransitions);
    };
    loadPreferences();
  }, []);

  return (
    <NavigationProvider
      enableTransitions={enableTransitions}
      reducedMotion={reducedMotion}
    >
      <DashboardAppContent />
    </NavigationProvider>
  );
};

const App: React.FC = () => {
  return (
    <NotificationServiceProvider>
      <PortsProvider>
        <DashboardApp />
      </PortsProvider>
    </NotificationServiceProvider>
  );
};

export default App;
