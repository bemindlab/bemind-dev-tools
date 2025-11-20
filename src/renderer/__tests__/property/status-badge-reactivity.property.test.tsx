import { describe, it, expect, afterEach } from "vitest";
import * as fc from "fast-check";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { ToolCard } from "../../components/ToolCard";
import { Tool, ToolStatus } from "../../types/dashboard";

/**
 * Feature: dev-tools-dashboard, Property 12: Status badge reactivity
 * Validates: Requirements 4.3
 *
 * Property: For any tool, when its status changes, the tool card's status badge
 * should update to reflect the new status within the next render cycle
 */
describe("Property 12: Status badge reactivity", () => {
  afterEach(() => {
    cleanup();
  });

  // Arbitrary for tool status states
  const toolStatusStateArb = fc.constantFrom(
    "idle" as const,
    "active" as const,
    "warning" as const,
    "error" as const
  );

  // Create a minimal tool for testing
  const createTestTool = (id: string): Tool => ({
    id,
    name: `Tool ${id}`,
    description: "Test tool",
    icon: "🔧",
    category: ["test"],
    component: () => <div>Test Component</div>,
  });

  it("should update status badge when status changes from undefined to defined", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        toolStatusStateArb,
        (toolId, statusState) => {
          const tool = createTestTool(toolId);

          // Initial render without status
          const { rerender, container } = render(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              status={undefined}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should not have status badge initially
          const initialStatusBadge = container.querySelector(
            '[aria-label^="Status:"]'
          );
          expect(initialStatusBadge).toBeNull();

          // Create new status
          const newStatus: ToolStatus = {
            toolId,
            state: statusState,
            lastUpdated: Date.now(),
          };

          // Rerender with new status
          rerender(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              status={newStatus}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should now have status badge with correct state
          const statusBadge = container.querySelector(
            '[aria-label^="Status:"]'
          );
          expect(statusBadge).not.toBeNull();
          expect(statusBadge?.textContent).toBe(statusState);

          // Cleanup after each property test iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should update status badge when status state changes", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        toolStatusStateArb,
        toolStatusStateArb,
        (toolId, initialState, newState) => {
          // Skip if states are the same
          fc.pre(initialState !== newState);

          const tool = createTestTool(toolId);

          // Initial render with first status
          const initialStatus: ToolStatus = {
            toolId,
            state: initialState,
            lastUpdated: Date.now(),
          };

          const { rerender, container } = render(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              status={initialStatus}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should have initial status
          let statusBadge = container.querySelector('[aria-label^="Status:"]');
          expect(statusBadge).not.toBeNull();
          expect(statusBadge?.textContent).toBe(initialState);

          // Update status
          const updatedStatus: ToolStatus = {
            toolId,
            state: newState,
            lastUpdated: Date.now(),
          };

          // Rerender with updated status
          rerender(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              status={updatedStatus}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should now have updated status
          statusBadge = container.querySelector('[aria-label^="Status:"]');
          expect(statusBadge).not.toBeNull();
          expect(statusBadge?.textContent).toBe(newState);

          // Cleanup after each property test iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should remove status badge when status changes from defined to undefined", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        toolStatusStateArb,
        (toolId, statusState) => {
          const tool = createTestTool(toolId);

          // Initial render with status
          const initialStatus: ToolStatus = {
            toolId,
            state: statusState,
            lastUpdated: Date.now(),
          };

          const { rerender, container } = render(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              status={initialStatus}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should have status badge
          let statusBadge = container.querySelector('[aria-label^="Status:"]');
          expect(statusBadge).not.toBeNull();

          // Rerender without status
          rerender(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              status={undefined}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should not have status badge anymore
          statusBadge = container.querySelector('[aria-label^="Status:"]');
          expect(statusBadge).toBeNull();

          // Cleanup after each property test iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
