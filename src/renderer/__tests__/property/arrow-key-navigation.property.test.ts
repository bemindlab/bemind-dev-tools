import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { HomePage } from "../../components/HomePage";
import { Tool } from "../../types/dashboard";

/**
 * **Feature: dev-tools-dashboard, Property 35: Arrow key navigation in grid**
 * **Validates: Requirements 10.5**
 *
 * Property: For any focused tool card, pressing arrow keys should move focus to adjacent tool cards in the grid (up/down/left/right)
 */

describe("Property 35: Arrow key navigation in grid", () => {
  it("should move focus right when ArrowRight is pressed", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a list of tools (at least 2 for meaningful navigation)
        fc
          .array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 5 }
          )
          .map((toolData) =>
            toolData.map((data, index) => ({
              id: `tool-${index}`,
              name: data.name,
              description: data.description,
              icon: "🔧",
              category: ["test"],
              component: () => React.createElement("div", null, "Mock Tool"),
            }))
          ),
        async (tools: Tool[]) => {
          const mockOnToolSelect = vi.fn();
          const mockOnToolPin = vi.fn();
          const mockOnToolUnpin = vi.fn();

          const { container } = render(
            React.createElement(HomePage, {
              tools,
              pinnedToolIds: [],
              recentlyUsedToolIds: [],
              onToolSelect: mockOnToolSelect,
              onToolPin: mockOnToolPin,
              onToolUnpin: mockOnToolUnpin,
            })
          );

          // Get all tool cards
          const toolCards = container.querySelectorAll(".tool-card");
          expect(toolCards.length).toBe(tools.length);

          // Focus first card
          (toolCards[0] as HTMLElement).focus();
          expect(document.activeElement).toBe(toolCards[0]);

          // Press ArrowRight
          fireEvent.keyDown(container.querySelector(".home-page")!, {
            key: "ArrowRight",
          });

          // Wait for the focus to move to the second card
          await waitFor(() => {
            expect(document.activeElement).toBe(toolCards[1]);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should move focus left when ArrowLeft is pressed", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a list of tools
        fc
          .array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 2, maxLength: 5 }
          )
          .map((toolData) =>
            toolData.map((data, index) => ({
              id: `tool-${index}`,
              name: data.name,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: () => React.createElement("div", null, "Mock Tool"),
            }))
          ),
        async (tools: Tool[]) => {
          const mockOnToolSelect = vi.fn();
          const mockOnToolPin = vi.fn();
          const mockOnToolUnpin = vi.fn();

          const { container } = render(
            React.createElement(HomePage, {
              tools,
              pinnedToolIds: [],
              recentlyUsedToolIds: [],
              onToolSelect: mockOnToolSelect,
              onToolPin: mockOnToolPin,
              onToolUnpin: mockOnToolUnpin,
            })
          );

          const toolCards = container.querySelectorAll(".tool-card");

          // Start from first card (default focus state is 0)
          // Move right first to get to second card
          fireEvent.keyDown(container.querySelector(".home-page")!, {
            key: "ArrowRight",
          });

          await waitFor(() => {
            expect(document.activeElement).toBe(toolCards[1]);
          });

          // Now press ArrowLeft to move back
          fireEvent.keyDown(container.querySelector(".home-page")!, {
            key: "ArrowLeft",
          });

          // Wait for the focus to move to the first card
          await waitFor(() => {
            expect(document.activeElement).toBe(toolCards[0]);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not move focus left from the first card", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a list of tools
        fc
          .array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 1, maxLength: 3 }
          )
          .map((toolData) =>
            toolData.map((data, index) => ({
              id: `tool-${index}`,
              name: data.name,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: () => React.createElement("div", null, "Mock Tool"),
            }))
          ),
        async (tools: Tool[]) => {
          const mockOnToolSelect = vi.fn();
          const mockOnToolPin = vi.fn();
          const mockOnToolUnpin = vi.fn();

          const { container } = render(
            React.createElement(HomePage, {
              tools,
              pinnedToolIds: [],
              recentlyUsedToolIds: [],
              onToolSelect: mockOnToolSelect,
              onToolPin: mockOnToolPin,
              onToolUnpin: mockOnToolUnpin,
            })
          );

          const toolCards = container.querySelectorAll(".tool-card");

          // Focus first card
          (toolCards[0] as HTMLElement).focus();
          expect(document.activeElement).toBe(toolCards[0]);

          // Press ArrowLeft (should stay on first card)
          fireEvent.keyDown(container.querySelector(".home-page")!, {
            key: "ArrowLeft",
          });

          // Should still be on first card - wait a bit to ensure no change
          await waitFor(
            () => {
              expect(document.activeElement).toBe(toolCards[0]);
            },
            { timeout: 100 }
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not move focus right from the last card", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a list of tools
        fc
          .array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 1, maxLength: 3 }
          )
          .map((toolData) =>
            toolData.map((data, index) => ({
              id: `tool-${index}`,
              name: data.name,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: () => React.createElement("div", null, "Mock Tool"),
            }))
          ),
        async (tools: Tool[]) => {
          const mockOnToolSelect = vi.fn();
          const mockOnToolPin = vi.fn();
          const mockOnToolUnpin = vi.fn();

          const { container } = render(
            React.createElement(HomePage, {
              tools,
              pinnedToolIds: [],
              recentlyUsedToolIds: [],
              onToolSelect: mockOnToolSelect,
              onToolPin: mockOnToolPin,
              onToolUnpin: mockOnToolUnpin,
            })
          );

          const toolCards = container.querySelectorAll(".tool-card");
          const lastIndex = toolCards.length - 1;

          // Navigate to last card by pressing ArrowRight repeatedly
          for (let i = 0; i < lastIndex; i++) {
            fireEvent.keyDown(container.querySelector(".home-page")!, {
              key: "ArrowRight",
            });
            await waitFor(() => {
              expect(document.activeElement).toBe(toolCards[i + 1]);
            });
          }

          // Now we're at the last card, press ArrowRight again
          fireEvent.keyDown(container.querySelector(".home-page")!, {
            key: "ArrowRight",
          });

          // Should still be on last card - wait a bit to ensure no change
          await waitFor(
            () => {
              expect(document.activeElement).toBe(toolCards[lastIndex]);
            },
            { timeout: 100 }
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle ArrowDown navigation in grid", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate enough tools to have multiple rows
        fc
          .array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 4, maxLength: 8 }
          )
          .map((toolData) =>
            toolData.map((data, index) => ({
              id: `tool-${index}`,
              name: data.name,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: () => React.createElement("div", null, "Mock Tool"),
            }))
          ),
        async (tools: Tool[]) => {
          const mockOnToolSelect = vi.fn();
          const mockOnToolPin = vi.fn();
          const mockOnToolUnpin = vi.fn();

          const { container } = render(
            React.createElement(HomePage, {
              tools,
              pinnedToolIds: [],
              recentlyUsedToolIds: [],
              onToolSelect: mockOnToolSelect,
              onToolPin: mockOnToolPin,
              onToolUnpin: mockOnToolUnpin,
            })
          );

          const toolCards = container.querySelectorAll(".tool-card");

          // Focus first card
          (toolCards[0] as HTMLElement).focus();

          // Press ArrowDown
          fireEvent.keyDown(container.querySelector(".home-page")!, {
            key: "ArrowDown",
          });

          // Wait for focus to move down
          await waitFor(() => {
            const focusedElement = document.activeElement;
            const focusedIndex = Array.from(toolCards).indexOf(
              focusedElement as HTMLElement
            );
            // Focus should have moved to a card further down (higher index)
            expect(focusedIndex).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle ArrowUp navigation in grid", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate enough tools to have multiple rows
        fc
          .array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 4, maxLength: 8 }
          )
          .map((toolData) =>
            toolData.map((data, index) => ({
              id: `tool-${index}`,
              name: data.name,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: () => React.createElement("div", null, "Mock Tool"),
            }))
          ),
        async (tools: Tool[]) => {
          const mockOnToolSelect = vi.fn();
          const mockOnToolPin = vi.fn();
          const mockOnToolUnpin = vi.fn();

          const { container } = render(
            React.createElement(HomePage, {
              tools,
              pinnedToolIds: [],
              recentlyUsedToolIds: [],
              onToolSelect: mockOnToolSelect,
              onToolPin: mockOnToolPin,
              onToolUnpin: mockOnToolUnpin,
            })
          );

          const toolCards = container.querySelectorAll(".tool-card");

          // First move down to get to a lower row
          fireEvent.keyDown(container.querySelector(".home-page")!, {
            key: "ArrowDown",
          });

          await waitFor(() => {
            const focusedElement = document.activeElement;
            const focusedIndex = Array.from(toolCards).indexOf(
              focusedElement as HTMLElement
            );
            expect(focusedIndex).toBeGreaterThan(0);
          });

          const indexAfterDown = Array.from(toolCards).indexOf(
            document.activeElement as HTMLElement
          );

          // Now press ArrowUp to move back up
          fireEvent.keyDown(container.querySelector(".home-page")!, {
            key: "ArrowUp",
          });

          // Wait for focus to move up
          await waitFor(() => {
            const focusedElement = document.activeElement;
            const focusedIndex = Array.from(toolCards).indexOf(
              focusedElement as HTMLElement
            );
            // Focus should have moved to a card further up (lower index than after down)
            expect(focusedIndex).toBeLessThan(indexAfterDown);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should prevent default behavior for arrow keys", () => {
    fc.assert(
      fc.property(
        // Generate a list of tools
        fc
          .array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 2, maxLength: 4 }
          )
          .map((toolData) =>
            toolData.map((data, index) => ({
              id: `tool-${index}`,
              name: data.name,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: () => React.createElement("div", null, "Mock Tool"),
            }))
          ),
        (tools: Tool[]) => {
          const mockOnToolSelect = vi.fn();
          const mockOnToolPin = vi.fn();
          const mockOnToolUnpin = vi.fn();

          const { container } = render(
            React.createElement(HomePage, {
              tools,
              pinnedToolIds: [],
              recentlyUsedToolIds: [],
              onToolSelect: mockOnToolSelect,
              onToolPin: mockOnToolPin,
              onToolUnpin: mockOnToolUnpin,
            })
          );

          const toolCards = container.querySelectorAll(".tool-card");
          (toolCards[0] as HTMLElement).focus();

          // Create a mock event with preventDefault
          const arrowRightEvent = new KeyboardEvent("keydown", {
            key: "ArrowRight",
            bubbles: true,
            cancelable: true,
          });
          const preventDefaultSpy = vi.spyOn(arrowRightEvent, "preventDefault");

          // Dispatch the event
          container.querySelector(".home-page")!.dispatchEvent(arrowRightEvent);

          // Verify preventDefault was called
          expect(preventDefaultSpy).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it.skip("should work with pinned and recently used sections", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate tools and randomly select some as pinned/recently used
        fc
          .array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 2, maxLength: 5 }
          )
          .map((toolData) =>
            toolData.map((data, index) => ({
              id: `tool-${index}`,
              name: data.name,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: () => React.createElement("div", null, "Mock Tool"),
            }))
          ),
        fc.array(fc.nat(), { minLength: 1, maxLength: 2 }),
        fc.array(fc.nat(), { minLength: 1, maxLength: 2 }),
        async (
          tools: Tool[],
          pinnedIndices: number[],
          recentIndices: number[]
        ) => {
          if (tools.length === 0) return;

          const pinnedToolIds = pinnedIndices
            .map((idx) => tools[idx % tools.length]?.id)
            .filter((id): id is string => id !== undefined)
            .slice(0, 2);

          const recentlyUsedToolIds = recentIndices
            .map((idx) => tools[idx % tools.length]?.id)
            .filter((id): id is string => id !== undefined)
            .slice(0, 2);

          const mockOnToolSelect = vi.fn();
          const mockOnToolPin = vi.fn();
          const mockOnToolUnpin = vi.fn();

          const { container } = render(
            React.createElement(HomePage, {
              tools,
              pinnedToolIds,
              recentlyUsedToolIds,
              onToolSelect: mockOnToolSelect,
              onToolPin: mockOnToolPin,
              onToolUnpin: mockOnToolUnpin,
            })
          );

          const toolCards = container.querySelectorAll(".tool-card");

          // Verify we have at least 2 cards to navigate between
          if (toolCards.length < 2) return;

          // Press ArrowRight from initial state (focus starts at index 0)
          fireEvent.keyDown(container.querySelector(".home-page")!, {
            key: "ArrowRight",
          });

          // Wait for focus to move to the next card
          await waitFor(() => {
            const focusedElement = document.activeElement;
            const focusedIndex = Array.from(toolCards).indexOf(
              focusedElement as HTMLElement
            );
            // Focus should have moved to index 1
            expect(focusedIndex).toBe(1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
