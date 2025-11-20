import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { UserPreferencesService } from "../../services/UserPreferences";

/**
 * Feature: dev-tools-dashboard, Property 25: Pin tool adds to pinned section
 * Validates: Requirements 8.2
 *
 * Property: For any unpinned tool, when pinned, the tool should appear in the pinned tools section
 */
describe("Property 25: Pin tool adds to pinned section", () => {
  it("should add any unpinned tool to pinned section when pinned", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (toolId) => {
        // Arrange: Create a fresh preferences service
        const service = new UserPreferencesService();
        service.clear();

        // Ensure tool is not pinned initially
        expect(service.isToolPinned(toolId)).toBe(false);

        // Act: Pin the tool
        service.pinTool(toolId);

        // Assert: Tool should be in pinned tools list
        const pinnedTools = service.getPinnedTools();
        expect(pinnedTools).toContain(toolId);
        expect(service.isToolPinned(toolId)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("should add multiple different tools to pinned section", () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 6 })
          .map((arr) => [...new Set(arr)]),
        (toolIds) => {
          // Arrange: Create a fresh preferences service
          const service = new UserPreferencesService();
          service.clear();

          // Act: Pin each tool (up to max of 6)
          const toolsToPin = toolIds.slice(0, 6);
          toolsToPin.forEach((toolId) => {
            service.pinTool(toolId);
          });

          // Assert: All pinned tools should be in the pinned section
          const pinnedTools = service.getPinnedTools();
          toolsToPin.forEach((toolId) => {
            expect(pinnedTools).toContain(toolId);
            expect(service.isToolPinned(toolId)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
