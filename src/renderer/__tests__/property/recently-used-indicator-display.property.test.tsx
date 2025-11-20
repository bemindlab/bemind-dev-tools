import { describe, it, expect, afterEach } from "vitest";
import * as fc from "fast-check";
import { render, cleanup } from "@testing-library/react";
import { ToolCard } from "../../components/ToolCard";
import { Tool } from "../../types/dashboard";

/**
 * Feature: dev-tools-dashboard, Property 14: Recently used indicator display
 * Validates: Requirements 4.5
 *
 * Property: For any tool in the recently used list, the tool card should display
 * a recently used indicator
 */
describe("Property 14: Recently used indicator display", () => {
  afterEach(() => {
    cleanup();
  });

  // Create a minimal tool for testing
  const createTestTool = (id: string, name: string): Tool => ({
    id,
    name,
    description: `Description for ${name}`,
    icon: "🔧",
    category: ["test"],
    component: () => <div>Test Component</div>,
  });

  it("should display recently used indicator when isRecentlyUsed is true", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (toolId, toolName) => {
          const tool = createTestTool(toolId, toolName);

          // Render with isRecentlyUsed = true
          const { container } = render(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={true}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should have recently used indicator
          const indicator = container.querySelector(
            '[aria-label="Recently used"]'
          );
          expect(indicator).not.toBeNull();
          expect(indicator?.textContent).toBe("⭐");

          // Cleanup after each property test iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not display recently used indicator when isRecentlyUsed is false", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (toolId, toolName) => {
          const tool = createTestTool(toolId, toolName);

          // Render with isRecentlyUsed = false
          const { container } = render(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should not have recently used indicator
          const indicator = container.querySelector(
            '[aria-label="Recently used"]'
          );
          expect(indicator).toBeNull();

          // Cleanup after each property test iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should display recently used indicator regardless of other props", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.boolean(),
        fc.integer({ min: 0, max: 100 }),
        (toolId, toolName, isPinned, notificationCount) => {
          const tool = createTestTool(toolId, toolName);

          // Render with isRecentlyUsed = true and various other props
          const { container } = render(
            <ToolCard
              tool={tool}
              isPinned={isPinned}
              isRecentlyUsed={true}
              notificationCount={notificationCount}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should have recently used indicator regardless of other props
          const indicator = container.querySelector(
            '[aria-label="Recently used"]'
          );
          expect(indicator).not.toBeNull();
          expect(indicator?.textContent).toBe("⭐");

          // Cleanup after each property test iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should update indicator when isRecentlyUsed changes from false to true", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (toolId, toolName) => {
          const tool = createTestTool(toolId, toolName);

          // Initial render with isRecentlyUsed = false
          const { rerender, container } = render(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should not have indicator initially
          let indicator = container.querySelector(
            '[aria-label="Recently used"]'
          );
          expect(indicator).toBeNull();

          // Rerender with isRecentlyUsed = true
          rerender(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={true}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should now have indicator
          indicator = container.querySelector('[aria-label="Recently used"]');
          expect(indicator).not.toBeNull();
          expect(indicator?.textContent).toBe("⭐");

          // Cleanup after each property test iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should remove indicator when isRecentlyUsed changes from true to false", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (toolId, toolName) => {
          const tool = createTestTool(toolId, toolName);

          // Initial render with isRecentlyUsed = true
          const { rerender, container } = render(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={true}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should have indicator initially
          let indicator = container.querySelector(
            '[aria-label="Recently used"]'
          );
          expect(indicator).not.toBeNull();

          // Rerender with isRecentlyUsed = false
          rerender(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              onSelect={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
            />
          );

          // Should not have indicator anymore
          indicator = container.querySelector('[aria-label="Recently used"]');
          expect(indicator).toBeNull();

          // Cleanup after each property test iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
