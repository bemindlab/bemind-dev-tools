import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { UserPreferencesService } from "../../services/UserPreferences";

/**
 * Feature: dev-tools-dashboard, Property 26: Pinned tools persistence round-trip
 * For any set of pinned tools, after persisting to storage and restoring
 * (simulating app restart), the pinned tools list should contain the same tools
 * Validates: Requirements 8.3
 */

describe("Property 26: Pinned tools persistence round-trip", () => {
  let preferencesService: UserPreferencesService;

  beforeEach(() => {
    localStorage.clear();
    preferencesService = new UserPreferencesService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should preserve pinned tools after persist and restore", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    const pinnedToolsArbitrary = fc
      .array(toolIdArbitrary, {
        minLength: 0,
        maxLength: 6,
      })
      .map((tools) => Array.from(new Set(tools))); // Ensure uniqueness

    await fc.assert(
      fc.asyncProperty(pinnedToolsArbitrary, async (pinnedTools) => {
        // Create fresh service for each iteration
        const service = new UserPreferencesService();

        // Pin all tools
        for (const toolId of pinnedTools) {
          service.pinTool(toolId);
        }

        const beforePersist = service.getPinnedTools();
        await service.persist();

        // Create new service instance to simulate app restart
        const newService = new UserPreferencesService();
        await newService.restore();

        const afterRestore = newService.getPinnedTools();

        // Verify same length
        expect(afterRestore.length).toBe(beforePersist.length);

        // Verify same tools (order should be preserved)
        expect(afterRestore).toEqual(beforePersist);
      }),
      { numRuns: 100 }
    );
  });

  it("should handle empty pinned list in round-trip", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        const beforePersist = preferencesService.getPinnedTools();
        expect(beforePersist.length).toBe(0);

        await preferencesService.persist();

        const newService = new UserPreferencesService();
        await newService.restore();

        const afterRestore = newService.getPinnedTools();
        expect(afterRestore.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should preserve order of pinned tools in round-trip", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    const uniquePinnedToolsArbitrary = fc
      .array(toolIdArbitrary, {
        minLength: 1,
        maxLength: 6,
      })
      .map((tools) => Array.from(new Set(tools)))
      .filter((tools) => tools.length >= 1);

    await fc.assert(
      fc.asyncProperty(uniquePinnedToolsArbitrary, async (pinnedTools) => {
        // Create fresh service for each iteration
        const service = new UserPreferencesService();

        // Pin tools in order
        for (const toolId of pinnedTools) {
          service.pinTool(toolId);
        }

        const beforePersist = service.getPinnedTools();
        await service.persist();

        const newService = new UserPreferencesService();
        await newService.restore();

        const afterRestore = newService.getPinnedTools();

        // Verify same length
        expect(afterRestore.length).toBe(beforePersist.length);

        // Verify same order
        for (let i = 0; i < beforePersist.length; i++) {
          expect(afterRestore[i]).toBe(beforePersist[i]);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should handle corrupted localStorage gracefully", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });

    await fc.assert(
      fc.asyncProperty(toolIdArbitrary, async (toolId) => {
        // Create fresh service for each iteration
        const service = new UserPreferencesService();

        service.pinTool(toolId);
        await service.persist();

        // Corrupt the localStorage data
        localStorage.setItem(
          "dev-tools-dashboard-preferences",
          "{ invalid json"
        );

        const newService = new UserPreferencesService();
        await expect(newService.restore()).resolves.not.toThrow();

        // After corrupted restore, should have default empty state
        const afterRestore = newService.getPinnedTools();
        expect(afterRestore.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should preserve pinned tools with maximum limit", async () => {
    const sixToolsArbitrary = fc
      .array(fc.string({ minLength: 1, maxLength: 20 }), {
        minLength: 6,
        maxLength: 6,
      })
      .map((tools) => Array.from(new Set(tools)))
      .filter((tools) => tools.length === 6);

    await fc.assert(
      fc.asyncProperty(sixToolsArbitrary, async (sixTools) => {
        // Create fresh service for each iteration
        const service = new UserPreferencesService();

        // Pin exactly 6 tools (the maximum)
        for (const toolId of sixTools) {
          service.pinTool(toolId);
        }

        const beforePersist = service.getPinnedTools();
        expect(beforePersist.length).toBe(6);

        await service.persist();

        const newService = new UserPreferencesService();
        await newService.restore();

        const afterRestore = newService.getPinnedTools();

        // Verify all 6 tools are preserved
        expect(afterRestore.length).toBe(6);
        expect(afterRestore).toEqual(beforePersist);
      }),
      { numRuns: 100 }
    );
  });

  it("should preserve pinned tools independently of recently used", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    const pinnedToolsArbitrary = fc
      .array(toolIdArbitrary, {
        minLength: 1,
        maxLength: 6,
      })
      .map((tools) => Array.from(new Set(tools)))
      .filter((tools) => tools.length >= 1);

    const recentToolsArbitrary = fc
      .array(toolIdArbitrary, {
        minLength: 1,
        maxLength: 3,
      })
      .map((tools) => Array.from(new Set(tools)))
      .filter((tools) => tools.length >= 1);

    await fc.assert(
      fc.asyncProperty(
        pinnedToolsArbitrary,
        recentToolsArbitrary,
        async (pinnedTools, recentTools) => {
          // Create fresh service for each iteration
          const service = new UserPreferencesService();

          // Pin tools
          for (const toolId of pinnedTools) {
            service.pinTool(toolId);
          }

          // Add recently used tools
          for (const toolId of recentTools) {
            service.addRecentlyUsed(toolId);
          }

          const beforePinnedTools = service.getPinnedTools();
          const beforeRecentTools = service.getRecentlyUsedTools();

          await service.persist();

          const newService = new UserPreferencesService();
          await newService.restore();

          const afterPinnedTools = newService.getPinnedTools();
          const afterRecentTools = newService.getRecentlyUsedTools();

          // Verify pinned tools are preserved
          expect(afterPinnedTools).toEqual(beforePinnedTools);

          // Verify recently used tools are also preserved (independence check)
          expect(afterRecentTools.length).toBe(beforeRecentTools.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
