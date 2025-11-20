import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { HomePage } from "../../components/HomePage";
import { Tool } from "../../types/dashboard";

/**
 * **Feature: dev-tools-dashboard, Property 32: Enter key opens focused tool**
 * **Validates: Requirements 10.2**
 *
 * Property: For any tool card with focus, pressing Enter should navigate to that tool's view
 */

describe("Property 32: Enter key opens focused tool", () => {
  it("should open the focused tool when Enter is pressed", { timeout: 15000 }, () => {
    fc.assert(
      fc.property(
        // Generate a list of tools (at least 1 for meaningful test)
        fc
          .array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ minLength: 1, maxLength: 100 }),
              icon: fc.string({ minLength: 1, maxLength: 5 }),
            }),
            { minLength: 1, maxLength: 5 }
          )
          .map((toolData) =>
            toolData.map((data, index) => ({
              id: `tool-${index}`,
              name: data.name,
              description: data.description,
              icon: data.icon,
              category: ["test"],
              component: () => React.createElement("div", null, "Mock Tool"),
            }))
          ),
        // Generate which tool to focus (index)
        fc.nat(),
        (tools: Tool[], focusIndex: number) => {
          if (tools.length === 0) return;

          const toolToFocus = tools[focusIndex % tools.length];
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

          // Focus the specific tool card
          const cardToFocus = toolCards[
            focusIndex % tools.length
          ] as HTMLElement;
          cardToFocus.focus();
          expect(document.activeElement).toBe(cardToFocus);

          // Press Enter on the focused card
          fireEvent.keyDown(cardToFocus, { key: "Enter" });

          // Verify onToolSelect was called with the correct tool ID
          expect(mockOnToolSelect).toHaveBeenCalled();
          expect(mockOnToolSelect).toHaveBeenCalledWith(toolToFocus.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should open the correct tool when Enter is pressed on different focused cards", () => {
    fc.assert(
      fc.property(
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

          // Get all tool cards
          const toolCards = container.querySelectorAll(".tool-card");

          // Test each tool card
          toolCards.forEach((card, index) => {
            mockOnToolSelect.mockClear();

            // Focus and press Enter on this card
            (card as HTMLElement).focus();
            fireEvent.keyDown(card, { key: "Enter" });

            // Verify the correct tool was selected
            expect(mockOnToolSelect).toHaveBeenCalledWith(tools[index].id);
            expect(mockOnToolSelect).toHaveBeenCalledTimes(1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should open tool when Enter is pressed in pinned and recently used sections", () => {
    fc.assert(
      fc.property(
        // Generate tools
        fc
          .array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            { minLength: 3, maxLength: 6 }
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
        // Generate pinned and recently used indices
        fc.array(fc.nat(), { minLength: 1, maxLength: 2 }),
        fc.array(fc.nat(), { minLength: 1, maxLength: 2 }),
        (tools: Tool[], pinnedIndices: number[], recentIndices: number[]) => {
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

          // Get all tool cards (from all sections)
          const toolCards = container.querySelectorAll(".tool-card");

          // Test the first card (which should be from pinned or recently used)
          if (toolCards.length > 0) {
            const firstCard = toolCards[0] as HTMLElement;
            firstCard.focus();
            fireEvent.keyDown(firstCard, { key: "Enter" });

            // Verify onToolSelect was called
            expect(mockOnToolSelect).toHaveBeenCalled();
            expect(mockOnToolSelect).toHaveBeenCalledTimes(1);

            // The called tool ID should be one of the tools
            const calledToolId = mockOnToolSelect.mock.calls[0][0];
            expect(tools.some((tool) => tool.id === calledToolId)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should only call onToolSelect once per Enter press", () => {
    fc.assert(
      fc.property(
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

          // Get first tool card
          const toolCards = container.querySelectorAll(".tool-card");
          if (toolCards.length > 0) {
            const firstCard = toolCards[0] as HTMLElement;
            firstCard.focus();

            // Press Enter once
            fireEvent.keyDown(firstCard, { key: "Enter" });

            // Verify called exactly once
            expect(mockOnToolSelect).toHaveBeenCalledTimes(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
