import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { UserPreferencesService } from "../../services/UserPreferences";

/**
 * Feature: dev-tools-dashboard, Property 28: Pin limit enforcement
 * For any dashboard state, the number of pinned tools should never exceed 6,
 * and attempts to pin beyond this limit should be rejected or require unpinning another tool
 * Validates: Requirements 8.5
 */

describe("Property 28: Pin limit enforcement", () => {
  let preferencesService: UserPreferencesService;

  beforeEach(() => {
    preferencesService = new UserPreferencesService();
  });

  it("should never allow more than 6 pinned tools", () => {
    // Generate arbitrary sequences of pin/unpin operations
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });
    const operationArbitrary = fc.oneof(
      fc.record({ type: fc.constant("pin" as const), toolId: toolIdArbitrary }),
      fc.record({
        type: fc.constant("unpin" as const),
        toolId: toolIdArbitrary,
      })
    );

    const operationsArbitrary = fc.array(operationArbitrary, {
      minLength: 1,
      maxLength: 50,
    });

    fc.assert(
      fc.property(operationsArbitrary, (operations) => {
        // Execute the sequence of operations
        for (const operation of operations) {
          if (operation.type === "pin") {
            try {
              preferencesService.pinTool(operation.toolId);
            } catch (error) {
              // Pin might fail if limit is reached - this is expected
              // Verify the error message is correct
              if (error instanceof Error) {
                expect(error.message).toContain("Maximum 6 pinned tools");
              }
            }
          } else {
            preferencesService.unpinTool(operation.toolId);
          }

          // Property: After any operation, pinned tools should never exceed 6
          const pinnedTools = preferencesService.getPinnedTools();
          expect(pinnedTools.length).toBeLessThanOrEqual(6);
        }

        // Cleanup for next iteration
        preferencesService.clear();
      }),
      { numRuns: 100 }
    );
  });

  it("should reject pinning when limit is reached", () => {
    // Generate exactly 6 unique tool IDs
    const sixToolsArbitrary = fc
      .array(fc.string({ minLength: 1, maxLength: 20 }), {
        minLength: 6,
        maxLength: 6,
      })
      .map((tools) => Array.from(new Set(tools))) // Ensure uniqueness
      .filter((tools) => tools.length === 6); // Only keep if we have exactly 6 unique

    fc.assert(
      fc.property(
        sixToolsArbitrary,
        fc.string({ minLength: 1, maxLength: 20 }),
        (sixTools, seventhTool) => {
          // Ensure the seventh tool is different from the first six
          fc.pre(!sixTools.includes(seventhTool));

          // Pin 6 tools
          for (const toolId of sixTools) {
            preferencesService.pinTool(toolId);
          }

          // Verify we have 6 pinned tools
          expect(preferencesService.getPinnedTools().length).toBe(6);

          // Attempt to pin a 7th tool should throw an error
          expect(() => preferencesService.pinTool(seventhTool)).toThrow(
            "Maximum 6 pinned tools"
          );

          // Verify we still have exactly 6 pinned tools
          expect(preferencesService.getPinnedTools().length).toBe(6);

          // Verify the 7th tool was not added
          expect(preferencesService.isToolPinned(seventhTool)).toBe(false);

          // Cleanup for next iteration
          preferencesService.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should allow pinning after unpinning when at limit", () => {
    const toolIdsArbitrary = fc
      .array(fc.string({ minLength: 1, maxLength: 20 }), {
        minLength: 7,
        maxLength: 7,
      })
      .map((tools) => Array.from(new Set(tools)))
      .filter((tools) => tools.length === 7);

    fc.assert(
      fc.property(toolIdsArbitrary, (toolIds) => {
        const [first, second, third, fourth, fifth, sixth, seventh] = toolIds;

        // Pin 6 tools
        preferencesService.pinTool(first);
        preferencesService.pinTool(second);
        preferencesService.pinTool(third);
        preferencesService.pinTool(fourth);
        preferencesService.pinTool(fifth);
        preferencesService.pinTool(sixth);

        // Verify we have 6 pinned tools
        expect(preferencesService.getPinnedTools().length).toBe(6);

        // Attempt to pin 7th should fail
        expect(() => preferencesService.pinTool(seventh)).toThrow();

        // Unpin one tool
        preferencesService.unpinTool(first);

        // Verify we now have 5 pinned tools
        expect(preferencesService.getPinnedTools().length).toBe(5);

        // Now we should be able to pin the 7th tool
        expect(() => preferencesService.pinTool(seventh)).not.toThrow();

        // Verify we have 6 pinned tools again
        expect(preferencesService.getPinnedTools().length).toBe(6);

        // Verify the 7th tool is now pinned
        expect(preferencesService.isToolPinned(seventh)).toBe(true);

        // Cleanup for next iteration
        preferencesService.clear();
      }),
      { numRuns: 100 }
    );
  });

  it("should handle duplicate pin attempts gracefully", () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });

    fc.assert(
      fc.property(toolIdArbitrary, (toolId) => {
        // Pin the tool
        preferencesService.pinTool(toolId);

        // Verify it's pinned
        expect(preferencesService.isToolPinned(toolId)).toBe(true);
        const countAfterFirst = preferencesService.getPinnedTools().length;

        // Attempt to pin the same tool again
        preferencesService.pinTool(toolId);

        // Verify the count hasn't changed (no duplicate)
        expect(preferencesService.getPinnedTools().length).toBe(
          countAfterFirst
        );

        // Verify it's still pinned
        expect(preferencesService.isToolPinned(toolId)).toBe(true);

        // Cleanup for next iteration
        preferencesService.clear();
      }),
      { numRuns: 100 }
    );
  });
});
