import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { toolRegistry } from "../../services/ToolRegistry";
import { registerAllTools } from "../../tools/registerTools";
import { NotificationServiceProvider } from "../../services";

// Mock the Electron API
vi.mock("../../utils/portsApi", () => ({
  getPortsAPI: () => ({
    scanPorts: vi.fn().mockResolvedValue([]),
    startMonitoring: vi.fn().mockResolvedValue([]),
    stopMonitoring: vi.fn().mockResolvedValue(undefined),
    killProcess: vi.fn().mockResolvedValue({ success: true }),
    openInBrowser: vi.fn().mockResolvedValue({ success: true }),
    onPortAdded: vi.fn().mockReturnValue(() => {}),
    onPortRemoved: vi.fn().mockReturnValue(() => {}),
    onPortUpdated: vi.fn().mockReturnValue(() => {}),
  }),
  isElectronRuntime: () => true,
  BROWSER_API_ERROR: "Browser API not available",
}));

// Mock CSS imports
vi.mock("../../components/PortsToolbar.css", () => ({}));
vi.mock("../../components/PortsList.css", () => ({}));
vi.mock("../../components/PortItem.css", () => ({}));
vi.mock("../../components/PortDetailsPanel.css", () => ({}));
vi.mock("../../components/ConfirmDialog.css", () => ({}));

describe("Ports Manager Integration", () => {
  beforeEach(() => {
    // Clear registry before each test
    toolRegistry.clear();
  });

  afterEach(() => {
    // Clean up after each test
    toolRegistry.clear();
  });

  describe("Tool Registration", () => {
    it("should register Ports Manager tool with correct metadata", () => {
      registerAllTools();

      const tool = toolRegistry.getTool("ports-manager");
      expect(tool).toBeDefined();
      expect(tool?.id).toBe("ports-manager");
      expect(tool?.name).toBe("Local Ports Manager");
      expect(tool?.description).toBe(
        "Monitor and manage local development ports"
      );
      expect(tool?.icon).toBe("🔌");
      expect(tool?.category).toContain("networking");
      expect(tool?.category).toContain("monitoring");
      expect(tool?.category).toContain("development");
      expect(tool?.component).toBeDefined();
      expect(typeof tool?.component).toBe("function");
      expect(tool?.features).toContain("Real-time port monitoring");
      expect(tool?.features).toContain("Kill processes on ports");
      expect(tool?.features).toContain("Open ports in browser");
      expect(tool?.version).toBe("1.0.0");
    });

    it("should be searchable by name", () => {
      registerAllTools();

      const results = toolRegistry.searchTools("ports");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("ports-manager");
    });

    it("should be searchable by description", () => {
      registerAllTools();

      const results = toolRegistry.searchTools("monitor");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("ports-manager");
    });

    it("should be filterable by category", () => {
      registerAllTools();

      const networkingTools = toolRegistry.getToolsByCategory("networking");
      expect(networkingTools).toHaveLength(1);
      expect(networkingTools[0].id).toBe("ports-manager");

      const monitoringTools = toolRegistry.getToolsByCategory("monitoring");
      expect(monitoringTools).toHaveLength(1);
      expect(monitoringTools[0].id).toBe("ports-manager");
    });
  });

  describe("Tool Component", () => {
    it("should render Ports Manager tool component", async () => {
      registerAllTools();
      const tool = toolRegistry.getTool("ports-manager");
      expect(tool).toBeDefined();

      const PortsManagerTool = tool!.component;

      render(
        <NotificationServiceProvider>
          <PortsManagerTool isActive={true} />
        </NotificationServiceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Local Ports Manager")).toBeInTheDocument();
      });
    });

    it("should implement ToolComponentProps interface", async () => {
      registerAllTools();
      const tool = toolRegistry.getTool("ports-manager");
      expect(tool).toBeDefined();

      const PortsManagerTool = tool!.component;
      const onStateChange = vi.fn();
      const initialState = {
        selectedPort: null,
        filters: {
          search: "",
          portRange: null,
          protocol: "ALL" as const,
        },
        isMonitoring: false,
      };

      render(
        <NotificationServiceProvider>
          <PortsManagerTool
            isActive={true}
            onStateChange={onStateChange}
            initialState={initialState}
          />
        </NotificationServiceProvider>
      );

      // Component should render without errors
      await waitFor(() => {
        expect(screen.getByText("Local Ports Manager")).toBeInTheDocument();
      });
    });
  });

  describe("State Preservation", () => {
    it("should call onStateChange when state changes", async () => {
      registerAllTools();
      const tool = toolRegistry.getTool("ports-manager");
      const PortsManagerTool = tool!.component;
      const onStateChange = vi.fn();

      render(
        <NotificationServiceProvider>
          <PortsManagerTool isActive={true} onStateChange={onStateChange} />
        </NotificationServiceProvider>
      );

      await waitFor(() => {
        expect(onStateChange).toHaveBeenCalled();
      });

      // Verify state structure
      const lastCall =
        onStateChange.mock.calls[onStateChange.mock.calls.length - 1];
      const state = lastCall[0];
      expect(state).toHaveProperty("selectedPort");
      expect(state).toHaveProperty("filters");
      expect(state).toHaveProperty("isMonitoring");
    });

    it("should restore initial state when provided", async () => {
      registerAllTools();
      const tool = toolRegistry.getTool("ports-manager");
      const PortsManagerTool = tool!.component;
      const initialState = {
        selectedPort: 3000,
        filters: {
          search: "node",
          portRange: [3000, 4000] as [number, number],
          protocol: "TCP" as const,
        },
        isMonitoring: true,
      };

      render(
        <NotificationServiceProvider>
          <PortsManagerTool isActive={true} initialState={initialState} />
        </NotificationServiceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Local Ports Manager")).toBeInTheDocument();
      });

      // Component should render without errors with initial state
      expect(screen.getByText("Local Ports Manager")).toBeInTheDocument();
    });

    it("should handle corrupted initial state gracefully", async () => {
      registerAllTools();
      const tool = toolRegistry.getTool("ports-manager");
      const PortsManagerTool = tool!.component;
      const corruptedState = { invalid: "state" };

      render(
        <NotificationServiceProvider>
          <PortsManagerTool isActive={true} initialState={corruptedState} />
        </NotificationServiceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Local Ports Manager")).toBeInTheDocument();
      });

      // Should render with default state
      expect(screen.getByText("Local Ports Manager")).toBeInTheDocument();
    });
  });

  describe("Functionality", () => {
    it("should display monitoring status", async () => {
      registerAllTools();
      const tool = toolRegistry.getTool("ports-manager");
      const PortsManagerTool = tool!.component;

      render(
        <NotificationServiceProvider>
          <PortsManagerTool isActive={true} />
        </NotificationServiceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/monitoring/i)).toBeInTheDocument();
      });
    });

    it("should display ports count", async () => {
      registerAllTools();
      const tool = toolRegistry.getTool("ports-manager");
      const PortsManagerTool = tool!.component;

      render(
        <NotificationServiceProvider>
          <PortsManagerTool isActive={true} />
        </NotificationServiceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/\d+ of \d+ ports/i)).toBeInTheDocument();
      });
    });
  });
});
