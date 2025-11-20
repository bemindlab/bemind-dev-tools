/**
 * Property-Based Test: Tooltip display on hover
 * Feature: dev-tools-dashboard, Property 38: Tooltip display on hover
 * Validates: Requirements 12.1
 *
 * Property: For any tool card, when hovered, a tooltip should be displayed
 * containing additional information about the tool
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";
import * as fc from "fast-check";
import { ToolCard } from "../../components/ToolCard";
import { Tool } from "../../types/dashboard";

describe("Property: Tooltip display on hover", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock window dimensions for tooltip positioning
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should display tooltip on hover for any tool with features", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          icon: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          category: fc.array(
            fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
            { minLength: 1 }
          ),
          features: fc.array(
            fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
            {
              minLength: 1,
              maxLength: 5,
            }
          ),
        }),
        (toolData) => {
          const tool: Tool = {
            ...toolData,
            component: () => null,
          };

          const { container, unmount } = render(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              onSelect={vi.fn()}
              onPin={vi.fn()}
              onUnpin={vi.fn()}
            />
          );

          const card = container.querySelector(".tool-card") as HTMLElement;
          expect(card).toBeTruthy();

          // Mock getBoundingClientRect for card
          const mockCardRect = {
            top: 100,
            left: 100,
            bottom: 200,
            right: 300,
            width: 200,
            height: 100,
            x: 100,
            y: 100,
            toJSON: () => ({}),
          };
          vi.spyOn(card, "getBoundingClientRect").mockReturnValue(mockCardRect);

          // Initially, tooltip should not be visible
          let tooltip = container.querySelector(".tool-tooltip");
          expect(tooltip).toBeFalsy();

          // Simulate mouse enter
          act(() => {
            fireEvent.mouseEnter(card);
            // Advance timers to show tooltip (500ms delay)
            vi.advanceTimersByTime(500);
          });

          // Tooltip should now be visible
          tooltip = container.querySelector(".tool-tooltip");
          expect(tooltip).toBeTruthy();

          // Mock tooltip getBoundingClientRect for positioning
          if (tooltip) {
            const mockTooltipRect = {
              top: 0,
              left: 0,
              bottom: 100,
              right: 200,
              width: 200,
              height: 100,
              x: 0,
              y: 0,
              toJSON: () => ({}),
            };
            vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue(
              mockTooltipRect
            );
          }

          // Tooltip should contain the features
          const tooltipText = tooltip?.textContent || "";
          expect(tooltipText).toContain("Features:");
          tool.features?.forEach((feature) => {
            expect(tooltipText).toContain(feature);
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not display tooltip immediately on hover (500ms delay)", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          icon: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          category: fc.array(
            fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
            { minLength: 1 }
          ),
          features: fc.array(
            fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
            {
              minLength: 1,
              maxLength: 5,
            }
          ),
        }),
        (toolData) => {
          const tool: Tool = {
            ...toolData,
            component: () => null,
          };

          const { container, unmount } = render(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              onSelect={vi.fn()}
              onPin={vi.fn()}
              onUnpin={vi.fn()}
            />
          );

          const card = container.querySelector(".tool-card") as HTMLElement;
          expect(card).toBeTruthy();

          // Mock getBoundingClientRect
          const mockCardRect = {
            top: 100,
            left: 100,
            bottom: 200,
            right: 300,
            width: 200,
            height: 100,
            x: 100,
            y: 100,
            toJSON: () => ({}),
          };
          vi.spyOn(card, "getBoundingClientRect").mockReturnValue(mockCardRect);

          // Simulate mouse enter
          act(() => {
            fireEvent.mouseEnter(card);
            // Advance timers by less than 500ms
            vi.advanceTimersByTime(300);
          });

          // Tooltip should not be visible yet
          const tooltip = container.querySelector(".tool-tooltip");
          expect(tooltip).toBeFalsy();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should hide tooltip after mouse leave with 200ms delay", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          icon: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          category: fc.array(
            fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
            { minLength: 1 }
          ),
          features: fc.array(
            fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
            {
              minLength: 1,
              maxLength: 5,
            }
          ),
        }),
        (toolData) => {
          const tool: Tool = {
            ...toolData,
            component: () => null,
          };

          const { container, unmount } = render(
            <ToolCard
              tool={tool}
              isPinned={false}
              isRecentlyUsed={false}
              onSelect={vi.fn()}
              onPin={vi.fn()}
              onUnpin={vi.fn()}
            />
          );

          const card = container.querySelector(".tool-card") as HTMLElement;
          expect(card).toBeTruthy();

          // Mock getBoundingClientRect for card
          const mockCardRect = {
            top: 100,
            left: 100,
            bottom: 200,
            right: 300,
            width: 200,
            height: 100,
            x: 100,
            y: 100,
            toJSON: () => ({}),
          };
          vi.spyOn(card, "getBoundingClientRect").mockReturnValue(mockCardRect);

          // Show tooltip
          act(() => {
            fireEvent.mouseEnter(card);
            // Advance timers to show tooltip
            vi.advanceTimersByTime(500);
          });

          // Tooltip should be visible
          let tooltip = container.querySelector(".tool-tooltip");
          expect(tooltip).toBeTruthy();

          // Mock tooltip getBoundingClientRect for positioning
          if (tooltip) {
            const mockTooltipRect = {
              top: 0,
              left: 0,
              bottom: 100,
              right: 200,
              width: 200,
              height: 100,
              x: 0,
              y: 0,
              toJSON: () => ({}),
            };
            vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue(
              mockTooltipRect
            );
          }

          // Mouse leave
          act(() => {
            fireEvent.mouseLeave(card);
            // Advance timers by less than 200ms - tooltip should still be visible
            vi.advanceTimersByTime(100);
          });

          tooltip = container.querySelector(".tool-tooltip");
          expect(tooltip).toBeTruthy();

          // Advance timers to complete the hide delay
          act(() => {
            vi.advanceTimersByTime(100);
          });

          // Tooltip should now be hidden
          tooltip = container.querySelector(".tool-tooltip");
          expect(tooltip).toBeFalsy();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
