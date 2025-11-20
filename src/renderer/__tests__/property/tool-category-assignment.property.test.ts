import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ToolRegistry } from "../../services/ToolRegistry";
import { Tool } from "../../types/dashboard";

/**
 * Feature: dev-tools-dashboard, Property 17: Tool category assignment
 * For any tool in the registry, the tool should have at least one category assigned
 * Validates: Requirements 6.1
 */

describe("Property 17: Tool category assignment", () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it("should ensure all registered tools have at least one category", () => {
    // Arbitrary for generating valid tool data
    const toolArbitrary = fc.record({
      id: fc.string({ minLength: 1 }),
      name: fc.string({ minLength: 1 }),
      description: fc.string({ minLength: 1 }),
      icon: fc.string({ minLength: 1 }),
      category: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
      component: fc.constant(() => null),
      features: fc.option(fc.array(fc.string()), { nil: undefined }),
      version: fc.option(fc.string(), { nil: undefined }),
    });

    fc.assert(
      fc.property(toolArbitrary, (toolData) => {
        const tool: Tool = {
          ...toolData,
          component: () => null,
        };

        // Register the tool
        registry.registerTool(tool);

        // Retrieve the tool
        const retrievedTool = registry.getTool(tool.id);

        // Property: Tool should have at least one category
        expect(retrievedTool).toBeDefined();
        expect(retrievedTool!.category).toBeDefined();
        expect(Array.isArray(retrievedTool!.category)).toBe(true);
        expect(retrievedTool!.category.length).toBeGreaterThanOrEqual(1);

        // Cleanup for next iteration
        registry.clear();
      }),
      { numRuns: 100 }
    );
  });

  it("should reject tools with empty category array", () => {
    const invalidTool = {
      id: "test-tool",
      name: "Test Tool",
      description: "A test tool",
      icon: "test-icon",
      category: [], // Empty array - should be rejected
      component: () => null,
    };

    expect(() => registry.registerTool(invalidTool as Tool)).toThrow(
      "Tool must have at least one category"
    );
  });

  it("should reject tools with no category field", () => {
    const invalidTool = {
      id: "test-tool",
      name: "Test Tool",
      description: "A test tool",
      icon: "test-icon",
      component: () => null,
    };

    expect(() => registry.registerTool(invalidTool as any)).toThrow(
      "Tool must have at least one category"
    );
  });
});
