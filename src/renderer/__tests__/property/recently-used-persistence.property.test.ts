import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { UserPreferencesService } from "../../services/UserPreferences";

/**
 * Feature: dev-tools-dashboard, Property 22: Recently used persistence round-trip
 * For any set of recently used tools, after persisting to storage and restoring
 * (simulating app restart), the recently used list should contain the same tools
 * in the same order
 * Validates: Requirements 7.4
 */

describe("Property 22: Recently used persistence round-trip", () => {
  let preferencesService: UserPreferencesService;

  beforeEach(() => {
    localStorage.clear();
    preferencesService = new UserPreferencesService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should preserve recently used tools after persist and restore", async () => {
    const recentToolArbitrary = fc.record({
      toolId: fc.string({ minLength: 1, maxLength: 20 }),
      lastAccessedAt: fc.integer({ min: 0, max: Date.now() }),
    });

    const recentToolsArbitrary = fc.array(recentToolArbitrary, {
      minLength: 0,
      maxLength: 3,
    });

    await fc.assert(
      fc.asyncProperty(recentToolsArbitrary, async (recentTools) => {
        for (const tool of recentTools) {
          preferencesService.addRecentlyUsed(tool.toolId);
        }

        const beforePersist = preferencesService.getRecentlyUsedTools();
        await preferencesService.persist();

        const newService = new UserPreferencesService();
        await newService.restore();

        const afterRestore = newService.getRecentlyUsedTools();

        expect(afterRestore.length).toBe(beforePersist.length);

        for (let i = 0; i < beforePersist.length; i++) {
          expect(afterRestore[i].toolId).toBe(beforePersist[i].toolId);
          expect(afterRestore[i].lastAccessedAt).toBe(
            beforePersist[i].lastAccessedAt
          );
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should handle empty recently used list in round-trip", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        const beforePersist = preferencesService.getRecentlyUsedTools();
        expect(beforePersist.length).toBe(0);

        await preferencesService.persist();

        const newService = new UserPreferencesService();
        await newService.restore();

        const afterRestore = newService.getRecentlyUsedTools();
        expect(afterRestore.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should preserve order of recently used tools in round-trip", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    const accessSequenceArbitrary = fc.array(toolIdArbitrary, {
      minLength: 1,
      maxLength: 10,
    });

    await fc.assert(
      fc.asyncProperty(accessSequenceArbitrary, async (accessSequence) => {
        for (const toolId of accessSequence) {
          preferencesService.addRecentlyUsed(toolId);
        }

        const beforePersist = preferencesService.getRecentlyUsedTools();
        await preferencesService.persist();

        const newService = new UserPreferencesService();
        await newService.restore();

        const afterRestore = newService.getRecentlyUsedTools();

        expect(afterRestore.length).toBe(beforePersist.length);

        for (let i = 0; i < beforePersist.length; i++) {
          expect(afterRestore[i].toolId).toBe(beforePersist[i].toolId);
          expect(afterRestore[i].lastAccessedAt).toBe(
            beforePersist[i].lastAccessedAt
          );
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should handle corrupted localStorage gracefully", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });

    await fc.assert(
      fc.asyncProperty(toolIdArbitrary, async (toolId) => {
        preferencesService.addRecentlyUsed(toolId);
        await preferencesService.persist();

        localStorage.setItem(
          "dev-tools-dashboard-preferences",
          "{ invalid json"
        );

        const newService = new UserPreferencesService();
        await expect(newService.restore()).resolves.not.toThrow();

        const afterRestore = newService.getRecentlyUsedTools();
        expect(afterRestore.length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should preserve recently used tools with unique tool IDs", async () => {
    const uniqueToolIdsArbitrary = fc
      .array(fc.string({ minLength: 1, maxLength: 20 }), {
        minLength: 1,
        maxLength: 5,
      })
      .map((tools) => Array.from(new Set(tools)))
      .filter((tools) => tools.length >= 1);

    await fc.assert(
      fc.asyncProperty(uniqueToolIdsArbitrary, async (toolIds) => {
        for (const toolId of toolIds) {
          preferencesService.addRecentlyUsed(toolId);
        }

        const beforePersist = preferencesService.getRecentlyUsedTools();
        await preferencesService.persist();

        const newService = new UserPreferencesService();
        await newService.restore();

        const afterRestore = newService.getRecentlyUsedTools();

        expect(afterRestore.length).toBe(beforePersist.length);

        const beforeToolIds = beforePersist.map((t) => t.toolId);
        const afterToolIds = afterRestore.map((t) => t.toolId);

        expect(afterToolIds).toEqual(beforeToolIds);
      }),
      { numRuns: 100 }
    );
  });
});
