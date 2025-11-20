import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { UserPreferencesService } from "../../services/UserPreferences";

/**
 * Feature: dev-tools-dashboard, Property 20: Recently used recording
 * Validates: Requirements 7.1
 *
 * Property: For any tool, when that tool is opened, it should be added to the recently used list
 */
describe("Property 20: Recently used recording", () => {
  it("should add any tool to recently used list when opened", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (toolId) => {
        // Arrange: Create a fresh preferences service
        const service = new UserPreferencesService();
        service.clear();

        // Act: Add tool to recently used
        service.addRecentlyUsed(toolId);

        // Assert: Tool should be in recently used list
        const recentTools = service.getRecentlyUsedTools();
        expect(recentTools.length).toBeGreaterThan(0);
        expect(recentTools[0].toolId).toBe(toolId);
      }),
      { numRuns: 100 }
    );
  });

  it("should add multiple different tools to recently used list", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
        (toolIds) => {
          // Arrange: Create a fresh preferences service
          const service = new UserPreferencesService();
          service.clear();

          // Act: Add each tool to recently used
          toolIds.forEach((toolId) => {
            service.addRecentlyUsed(toolId);
          });

          // Assert: All tools should be in recently used list (up to max of 3)
          const recentTools = service.getRecentlyUsedTools();
          expect(recentTools.length).toBeGreaterThan(0);

          // The most recently added tool should be first
          const lastToolId = toolIds[toolIds.length - 1];
          expect(recentTools[0].toolId).toBe(lastToolId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
