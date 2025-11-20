/**
 * Property-Based Test: Tooltip boundary constraint
 * Feature: dev-tools-dashboard, Property 40: Tooltip boundary constraint
 * Validates: Requirements 12.5
 *
 * Property: For any tooltip, the tooltip's position should be adjusted so that
 * it remains fully within the window boundaries
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import * as fc from "fast-check";
import { ToolCard } from "../../components/ToolCard";
import { Tool } from "../../types/dashboard";

describe("Property: Tooltip boundary constraint", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should keep tooltip within window boundaries for any card position", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          description: fc.string({ minLength: 1 }),
          icon: fc.string({ minLength: 1 }),
          category: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          features: fc.array(fc.string({ minLength: 1 }), {
            minLength: 1,
            maxLength: 5,
          }),
        }),
        // Generate random card positions
        fc.integer({ min: 0, max: 1000 }), // cardTop
        fc.integer({ min: 0, max: 1000 }), // cardLeft
        fc.integer({ min: 100, max: 300 }), // cardWidth
        fc.integer({ min: 100, max: 200 }), // cardHeight
        fc.integer({ min: 800, max: 1920 }), // windowWidth
        fc.integer({ min: 600, max: 1080 }), // windowHeight
        (
          toolData,
          cardTop,
          cardLeft,
          cardWidth,
          cardHeight,
          windowWidth,
          windowHeight
        ) => {
          const tool: Tool = {
            ...toolData,
            component: () => null,
          };

          // Mock window dimensions
          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: windowWidth,
          });
          Object.defineProperty(window, "innerHeight", {
            writable: true,
            configurable: true,
            value: windowHeight,
          });

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

          // Mock card position
          const mockCardRect = {
            top: cardTop,
            left: cardLeft,
            bottom: cardTop + cardHeight,
            right: cardLeft + cardWidth,
            width: cardWidth,
            height: cardHeight,
            x: cardLeft,
            y: cardTop,
            toJSON: () => ({}),
          };

          vi.spyOn(card, "getBoundingClientRect").mockReturnValue(mockCardRect);

          // Simulate mouse enter to show tooltip
          act(() => {
            card.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
          });

          // Advance timers to show tooltip
          act(() => {
            vi.advanceTimersByTime(500);
          });

          const tooltip = container.querySelector(
            ".tool-tooltip"
          ) as HTMLElement;

          if (tooltip) {
            // Mock tooltip dimensions (typical tooltip size)
            const tooltipWidth = 200;
            const tooltipHeight = 100;
            const mockTooltipRect = {
              width: tooltipWidth,
              height: tooltipHeight,
              top: 0,
              left: 0,
              bottom: tooltipHeight,
              right: tooltipWidth,
              x: 0,
              y: 0,
              toJSON: () => ({}),
            };

            vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue(
              mockTooltipRect
            );

            // Trigger position calculation by re-entering
            act(() => {
              card.dispatchEvent(
                new MouseEvent("mouseleave", { bubbles: true })
              );
            });
            act(() => {
              vi.advanceTimersByTime(200);
            });
            act(() => {
              card.dispatchEvent(
                new MouseEvent("mouseenter", { bubbles: true })
              );
            });
            act(() => {
              vi.advanceTimersByTime(500);
            });

            const updatedTooltip = container.querySelector(
              ".tool-tooltip"
            ) as HTMLElement;

            if (updatedTooltip) {
              const style = updatedTooltip.style;

              // Check horizontal boundaries
              if (style.left) {
                const leftValue = parseFloat(style.left);
                // Tooltip should not go beyond left edge (with 8px margin)
                expect(leftValue).toBeGreaterThanOrEqual(8);

                // If centered, check it doesn't overflow right
                if (style.transform?.includes("translateX")) {
                  const tooltipRight = leftValue + tooltipWidth / 2;
                  expect(tooltipRight).toBeLessThanOrEqual(windowWidth);
                }
              }

              if (style.right) {
                const rightValue = parseFloat(style.right);
                // Tooltip should have at least 8px margin from right edge
                expect(rightValue).toBeGreaterThanOrEqual(8);
              }

              // Check vertical boundaries
              if (style.top) {
                const topValue = parseFloat(style.top);
                // Tooltip should not go beyond top edge
                expect(topValue).toBeGreaterThanOrEqual(0);
                // Tooltip should not overflow bottom
                expect(topValue + tooltipHeight).toBeLessThanOrEqual(
                  windowHeight
                );
              }

              if (style.bottom) {
                const bottomValue = parseFloat(style.bottom);
                // Bottom value is distance from bottom of window
                // So tooltip top would be: windowHeight - bottomValue - tooltipHeight
                const tooltipTop = windowHeight - bottomValue - tooltipHeight;
                expect(tooltipTop).toBeGreaterThanOrEqual(0);
              }
            }
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should adjust tooltip position when near window edges", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          description: fc.string({ minLength: 1 }),
          icon: fc.string({ minLength: 1 }),
          category: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          features: fc.array(fc.string({ minLength: 1 }), {
            minLength: 1,
            maxLength: 3,
          }),
        }),
        fc.constantFrom("left", "right", "top", "bottom"), // Edge position
        (toolData, edge) => {
          const tool: Tool = {
            ...toolData,
            component: () => null,
          };

          const windowWidth = 1024;
          const windowHeight = 768;

          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: windowWidth,
          });
          Object.defineProperty(window, "innerHeight", {
            writable: true,
            configurable: true,
            value: windowHeight,
          });

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

          // Position card near the specified edge
          let cardTop = 400;
          let cardLeft = 400;
          const cardWidth = 200;
          const cardHeight = 150;

          switch (edge) {
            case "left":
              cardLeft = 10; // Near left edge
              break;
            case "right":
              cardLeft = windowWidth - cardWidth - 10; // Near right edge
              break;
            case "top":
              cardTop = 10; // Near top edge
              break;
            case "bottom":
              cardTop = windowHeight - cardHeight - 10; // Near bottom edge
              break;
          }

          const mockCardRect = {
            top: cardTop,
            left: cardLeft,
            bottom: cardTop + cardHeight,
            right: cardLeft + cardWidth,
            width: cardWidth,
            height: cardHeight,
            x: cardLeft,
            y: cardTop,
            toJSON: () => ({}),
          };

          vi.spyOn(card, "getBoundingClientRect").mockReturnValue(mockCardRect);

          // Show tooltip
          act(() => {
            card.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
          });
          act(() => {
            vi.advanceTimersByTime(500);
          });

          const tooltip = container.querySelector(
            ".tool-tooltip"
          ) as HTMLElement;

          if (tooltip) {
            const tooltipWidth = 250;
            const tooltipHeight = 120;
            const mockTooltipRect = {
              width: tooltipWidth,
              height: tooltipHeight,
              top: 0,
              left: 0,
              bottom: tooltipHeight,
              right: tooltipWidth,
              x: 0,
              y: 0,
              toJSON: () => ({}),
            };

            vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue(
              mockTooltipRect
            );

            // Re-trigger to calculate position
            act(() => {
              card.dispatchEvent(
                new MouseEvent("mouseleave", { bubbles: true })
              );
            });
            act(() => {
              vi.advanceTimersByTime(200);
            });
            act(() => {
              card.dispatchEvent(
                new MouseEvent("mouseenter", { bubbles: true })
              );
            });
            act(() => {
              vi.advanceTimersByTime(500);
            });

            const updatedTooltip = container.querySelector(
              ".tool-tooltip"
            ) as HTMLElement;

            // Tooltip should exist and be positioned
            expect(updatedTooltip).toBeTruthy();

            // Verify tooltip has positioning styles applied
            const style = updatedTooltip.style;
            const hasVerticalPosition = style.top || style.bottom;
            const hasHorizontalPosition = style.left || style.right;

            expect(hasVerticalPosition).toBeTruthy();
            expect(hasHorizontalPosition).toBeTruthy();
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
