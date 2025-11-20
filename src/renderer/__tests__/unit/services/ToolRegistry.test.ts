import { describe, it, expect, beforeEach } from "vitest";
import { ToolRegistry } from "../../../services/ToolRegistry";
import { Tool } from "../../../types/dashboard";

describe("ToolRegistry", () => {
  let registry: ToolRegistry;

  const createMockTool = (overrides: Partial<Tool> = {}): Tool => ({
    id: "test-tool",
    name: "Test Tool",
    description: "A test tool for testing",
    icon: "test-icon",
    category: ["testing"],
    component: () => null,
    ...overrides,
  });

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  describe("registerTool", () => {
    it("should register a valid tool", () => {
      const tool = createMockTool();
      registry.registerTool(tool);

      const retrieved = registry.getTool(tool.id);
      expect(retrieved).toEqual(tool);
    });

    it("should throw error for tool without id", () => {
      const tool = createMockTool({ id: "" });
      expect(() => registry.registerTool(tool)).toThrow(
        "Tool must have a valid id"
      );
    });

    it("should throw error for tool without name", () => {
      const tool = createMockTool({ name: "" });
      expect(() => registry.registerTool(tool)).toThrow(
        "Tool must have a valid name"
      );
    });

    it("should throw error for tool without description", () => {
      const tool = createMockTool({ description: "" });
      expect(() => registry.registerTool(tool)).toThrow(
        "Tool must have a valid description"
      );
    });

    it("should throw error for tool without icon", () => {
      const tool = createMockTool({ icon: "" });
      expect(() => registry.registerTool(tool)).toThrow(
        "Tool must have a valid icon"
      );
    });

    it("should throw error for tool without category", () => {
      const tool = createMockTool({ category: [] });
      expect(() => registry.registerTool(tool)).toThrow(
        "Tool must have at least one category"
      );
    });

    it("should throw error for tool without component", () => {
      const tool = createMockTool({ component: undefined as any });
      expect(() => registry.registerTool(tool)).toThrow(
        "Tool must have a component"
      );
    });

    it("should handle duplicate registration in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const tool = createMockTool();
      registry.registerTool(tool);

      expect(() => registry.registerTool(tool)).toThrow(
        'Tool with id "test-tool" is already registered'
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should warn but not throw for duplicate registration in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const tool = createMockTool();
      registry.registerTool(tool);

      // Should not throw in production
      expect(() => registry.registerTool(tool)).not.toThrow();

      // Tool should still be the original
      expect(registry.getTool(tool.id)).toEqual(tool);

      process.env.NODE_ENV = originalEnv;
    });

    it("should register tools with optional fields", () => {
      const tool = createMockTool({
        features: ["feature1", "feature2"],
        version: "1.0.0",
        metadata: { key: "value" },
      });

      registry.registerTool(tool);

      const retrieved = registry.getTool(tool.id);
      expect(retrieved?.features).toEqual(["feature1", "feature2"]);
      expect(retrieved?.version).toBe("1.0.0");
      expect(retrieved?.metadata).toEqual({ key: "value" });
    });
  });

  describe("unregisterTool", () => {
    it("should unregister a tool", () => {
      const tool = createMockTool();
      registry.registerTool(tool);

      registry.unregisterTool(tool.id);

      expect(registry.getTool(tool.id)).toBeUndefined();
    });

    it("should handle unregistering non-existent tool", () => {
      expect(() => registry.unregisterTool("non-existent")).not.toThrow();
    });
  });

  describe("getTool", () => {
    it("should return undefined for non-existent tool", () => {
      expect(registry.getTool("non-existent")).toBeUndefined();
    });

    it("should return the correct tool", () => {
      const tool1 = createMockTool({ id: "tool1", name: "Tool 1" });
      const tool2 = createMockTool({ id: "tool2", name: "Tool 2" });

      registry.registerTool(tool1);
      registry.registerTool(tool2);

      expect(registry.getTool("tool1")).toEqual(tool1);
      expect(registry.getTool("tool2")).toEqual(tool2);
    });
  });

  describe("getAllTools", () => {
    it("should return empty array when no tools registered", () => {
      expect(registry.getAllTools()).toEqual([]);
    });

    it("should return all registered tools", () => {
      const tool1 = createMockTool({ id: "tool1", name: "Tool 1" });
      const tool2 = createMockTool({ id: "tool2", name: "Tool 2" });
      const tool3 = createMockTool({ id: "tool3", name: "Tool 3" });

      registry.registerTool(tool1);
      registry.registerTool(tool2);
      registry.registerTool(tool3);

      const allTools = registry.getAllTools();
      expect(allTools).toHaveLength(3);
      expect(allTools).toContainEqual(tool1);
      expect(allTools).toContainEqual(tool2);
      expect(allTools).toContainEqual(tool3);
    });
  });

  describe("getToolsByCategory", () => {
    it("should return empty array when no tools match category", () => {
      const tool = createMockTool({ category: ["testing"] });
      registry.registerTool(tool);

      expect(registry.getToolsByCategory("non-existent")).toEqual([]);
    });

    it("should return tools matching the category", () => {
      const tool1 = createMockTool({
        id: "tool1",
        category: ["networking", "monitoring"],
      });
      const tool2 = createMockTool({
        id: "tool2",
        category: ["networking"],
      });
      const tool3 = createMockTool({
        id: "tool3",
        category: ["database"],
      });

      registry.registerTool(tool1);
      registry.registerTool(tool2);
      registry.registerTool(tool3);

      const networkingTools = registry.getToolsByCategory("networking");
      expect(networkingTools).toHaveLength(2);
      expect(networkingTools).toContainEqual(tool1);
      expect(networkingTools).toContainEqual(tool2);

      const databaseTools = registry.getToolsByCategory("database");
      expect(databaseTools).toHaveLength(1);
      expect(databaseTools).toContainEqual(tool3);
    });

    it("should handle tools with multiple categories", () => {
      const tool = createMockTool({
        category: ["networking", "monitoring", "debugging"],
      });
      registry.registerTool(tool);

      expect(registry.getToolsByCategory("networking")).toContainEqual(tool);
      expect(registry.getToolsByCategory("monitoring")).toContainEqual(tool);
      expect(registry.getToolsByCategory("debugging")).toContainEqual(tool);
    });
  });

  describe("searchTools", () => {
    beforeEach(() => {
      const tool1 = createMockTool({
        id: "ports-manager",
        name: "Local Ports Manager",
        description: "Monitor and manage local development servers",
      });
      const tool2 = createMockTool({
        id: "api-tester",
        name: "API Tester",
        description: "Test and debug REST APIs",
      });
      const tool3 = createMockTool({
        id: "db-viewer",
        name: "Database Viewer",
        description: "View and query databases",
      });

      registry.registerTool(tool1);
      registry.registerTool(tool2);
      registry.registerTool(tool3);
    });

    it("should return all tools for empty query", () => {
      expect(registry.searchTools("")).toHaveLength(3);
      expect(registry.searchTools("   ")).toHaveLength(3);
    });

    it("should search by name (case-insensitive)", () => {
      const results = registry.searchTools("api");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("api-tester");
    });

    it("should search by description (case-insensitive)", () => {
      const results = registry.searchTools("monitor");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("ports-manager");
    });

    it("should be case-insensitive", () => {
      expect(registry.searchTools("API")).toHaveLength(1);
      expect(registry.searchTools("Api")).toHaveLength(1);
      expect(registry.searchTools("api")).toHaveLength(1);
    });

    it("should return multiple matches", () => {
      const results = registry.searchTools("test");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("api-tester");
    });

    it("should return empty array when no matches", () => {
      expect(registry.searchTools("nonexistent")).toEqual([]);
    });

    it("should match partial strings", () => {
      const results = registry.searchTools("data");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("db-viewer");
    });
  });

  describe("clear", () => {
    it("should remove all tools", () => {
      const tool1 = createMockTool({ id: "tool1" });
      const tool2 = createMockTool({ id: "tool2" });

      registry.registerTool(tool1);
      registry.registerTool(tool2);

      expect(registry.getAllTools()).toHaveLength(2);

      registry.clear();

      expect(registry.getAllTools()).toHaveLength(0);
      expect(registry.getTool("tool1")).toBeUndefined();
      expect(registry.getTool("tool2")).toBeUndefined();
    });
  });

  describe("getToolCount", () => {
    it("should return 0 for empty registry", () => {
      expect(registry.getToolCount()).toBe(0);
    });

    it("should return correct count", () => {
      registry.registerTool(createMockTool({ id: "tool1" }));
      expect(registry.getToolCount()).toBe(1);

      registry.registerTool(createMockTool({ id: "tool2" }));
      expect(registry.getToolCount()).toBe(2);

      registry.unregisterTool("tool1");
      expect(registry.getToolCount()).toBe(1);
    });
  });
});
