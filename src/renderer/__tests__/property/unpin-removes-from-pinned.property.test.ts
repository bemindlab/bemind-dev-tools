import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { UserPreferencesService } from "../../services/UserPreferences";

/**
 * Feature: dev-tools-dashboard, Property 27: Unpin removes from pinned section
 * Validates: Requirements 8.4
 *
 * Property: For any pinned tool, when unpinned, the tool should be removed from the pinned tools section
 */
describe("Property 27: Unpin removes from pinned section", () => {
  it("should remove any pinned tool from pinned section when unpinned", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (toolId) => {
        // Arrange: Create a fresh preferences service and pin the tool
        const service = new UserPreferencesService();
        service.clear();
        service.pinTool(toolId);

        // Verify tool is pinned
        expect(service.isToolPinned(toolId)).toBe(true);

        // Act: Unpin the tool
        service.unpinTool(toolId);

        // Assert: Tool should not be in pinned tools list
        const pinnedTools = service.getPinnedTools();
        expect(pinnedTools).not.toContain(toolId);
        expect(service.isToolPinned(toolId)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("should remove specific tool from pinned section without affecting others", () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 6 })
          .map((arr) => [...new Set(arr)]),
        (toolIds) => {
          // Skip if we don't have at least 2 unique tools
          if (toolIds.length < 2) return true;

          // Arrange: Create a fresh preferences service and pin all tools
          const service = new UserPreferencesService();
          service.clear();

          const toolsToPin = toolIds.slice(0, 6);
          toolsToPin.forEach((toolId) => {
            service.pinTool(toolId);
          });

          // Select a tool to unpin (first one)
          const toolToUnpin = toolsToPin[0];
          const otherTools = toolsToPin.slice(1);

          // Act: Unpin one tool
          service.unpinTool(toolToUnpin);

          // Assert: Unpinned tool should not be in list
          const pinnedTools = service.getPinnedTools();
          expect(pinnedTools).not.toContain(toolToUnpin);
          expect(service.isToolPinned(toolToUnpin)).toBe(false);

          // Assert: Other tools should still be pinned
          otherTools.forEach((toolId) => {
            expect(pinnedTools).toContain(toolId);
            expect(service.isToolPinned(toolId)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
