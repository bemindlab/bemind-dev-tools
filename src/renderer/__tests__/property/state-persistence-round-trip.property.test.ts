import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { ToolStateManagerService } from "../../services/ToolStateManager";

/**
 * JSON-serializable arbitrary that handles edge cases properly
 * Excludes -0 since JSON doesn't distinguish between -0 and +0
 */
const jsonSerializableArbitrary = () =>
  fc.jsonValue().map((value) => JSON.parse(JSON.stringify(value)));

/**
 * Feature: dev-tools-dashboard, Property 37: State persistence round-trip
 * For any tool with critical state, after persisting on app close and restoring
 * on app open, the tool's critical state should be preserved
 * Validates: Requirements 11.4, 11.5
 */

describe("Property 37: State persistence round-trip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should preserve tool state after persist and restore", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    // Use JSON-serializable values only
    const stateArbitrary = jsonSerializableArbitrary();

    await fc.assert(
      fc.asyncProperty(
        toolIdArbitrary,
        stateArbitrary,
        async (toolId, state) => {
          // Create fresh service for each iteration
          const service = new ToolStateManagerService();

          // Save tool state
          service.saveToolState(toolId, state);

          // Persist to localStorage
          await service.persistState();

          // Create new service instance to simulate app restart
          const newService = new ToolStateManagerService();
          await newService.restoreState();

          // Load the state
          const restoredState = newService.loadToolState(toolId);

          // Verify state is preserved
          expect(restoredState).toEqual(state);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve multiple tool states independently", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    // Use JSON-serializable values only
    const stateArbitrary = jsonSerializableArbitrary();
    const toolStatesArbitrary = fc
      .array(
        fc.record({
          toolId: toolIdArbitrary,
          state: stateArbitrary,
        }),
        { minLength: 1, maxLength: 10 }
      )
      .map((tools) => {
        // Ensure unique tool IDs
        const uniqueMap = new Map();
        for (const tool of tools) {
          uniqueMap.set(tool.toolId, tool.state);
        }
        return Array.from(uniqueMap.entries()).map(([toolId, state]) => ({
          toolId,
          state,
        }));
      })
      .filter((tools) => tools.length >= 1);

    await fc.assert(
      fc.asyncProperty(toolStatesArbitrary, async (toolStates) => {
        // Create fresh service for each iteration
        const service = new ToolStateManagerService();

        // Save all tool states
        for (const { toolId, state } of toolStates) {
          service.saveToolState(toolId, state);
        }

        // Persist to localStorage
        await service.persistState();

        // Create new service instance to simulate app restart
        const newService = new ToolStateManagerService();
        await newService.restoreState();

        // Verify all states are preserved
        for (const { toolId, state } of toolStates) {
          const restoredState = newService.loadToolState(toolId);
          expect(restoredState).toEqual(state);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should handle empty state in round-trip", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        const service = new ToolStateManagerService();

        // Don't save any state
        await service.persistState();

        const newService = new ToolStateManagerService();
        await newService.restoreState();

        // Loading non-existent state should return undefined
        const restoredState = newService.loadToolState("non-existent-tool");
        expect(restoredState).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it("should handle corrupted localStorage gracefully", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    // Use JSON-serializable values only
    const stateArbitrary = jsonSerializableArbitrary();

    await fc.assert(
      fc.asyncProperty(
        toolIdArbitrary,
        stateArbitrary,
        async (toolId, state) => {
          // Create fresh service for each iteration
          const service = new ToolStateManagerService();

          service.saveToolState(toolId, state);
          await service.persistState();

          // Corrupt the localStorage data
          localStorage.setItem(
            `dev-tools-dashboard-tool-state-${toolId}`,
            "{ invalid json"
          );

          const newService = new ToolStateManagerService();
          // Should not throw
          await expect(newService.restoreState()).resolves.not.toThrow();

          // Corrupted state should not be loaded
          const restoredState = newService.loadToolState(toolId);
          expect(restoredState).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve complex nested state structures", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    const complexStateArbitrary = fc
      .record({
        counter: fc.integer(),
        text: fc.string(),
        nested: fc.record({
          flag: fc.boolean(),
          items: fc.array(fc.string(), { maxLength: 5 }),
        }),
        optional: fc.option(fc.double()),
      })
      .map((value) => JSON.parse(JSON.stringify(value)));

    await fc.assert(
      fc.asyncProperty(
        toolIdArbitrary,
        complexStateArbitrary,
        async (toolId, state) => {
          // Create fresh service for each iteration
          const service = new ToolStateManagerService();

          service.saveToolState(toolId, state);
          await service.persistState();

          const newService = new ToolStateManagerService();
          await newService.restoreState();

          const restoredState = newService.loadToolState(toolId);

          // Verify complex structure is preserved
          expect(restoredState).toEqual(state);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should clear tool state correctly", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    // Use JSON-serializable values only
    const stateArbitrary = jsonSerializableArbitrary();

    await fc.assert(
      fc.asyncProperty(
        toolIdArbitrary,
        stateArbitrary,
        async (toolId, state) => {
          // Create fresh service for each iteration
          const service = new ToolStateManagerService();

          service.saveToolState(toolId, state);
          await service.persistState();

          // Clear the state
          service.clearToolState(toolId);

          // State should be undefined after clearing
          const clearedState = service.loadToolState(toolId);
          expect(clearedState).toBeUndefined();

          // Persist after clearing
          await service.persistState();

          // Restore in new service
          const newService = new ToolStateManagerService();
          await newService.restoreState();

          // State should still be undefined
          const restoredState = newService.loadToolState(toolId);
          expect(restoredState).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle state updates correctly", async () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    // Use JSON-serializable values only
    const stateArbitrary = jsonSerializableArbitrary();

    await fc.assert(
      fc.asyncProperty(
        toolIdArbitrary,
        stateArbitrary,
        stateArbitrary,
        async (toolId, initialState, updatedState) => {
          // Create fresh service for each iteration
          const service = new ToolStateManagerService();

          // Save initial state
          service.saveToolState(toolId, initialState);
          await service.persistState();

          // Update state
          service.saveToolState(toolId, updatedState);
          await service.persistState();

          // Restore in new service
          const newService = new ToolStateManagerService();
          await newService.restoreState();

          const restoredState = newService.loadToolState(toolId);

          // Should have the updated state, not the initial state
          expect(restoredState).toEqual(updatedState);
        }
      ),
      { numRuns: 100 }
    );
  });
});
