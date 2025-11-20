import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render, fireEvent } from "@testing-library/react";
import { ToolCard } from "../../components/ToolCard";
import { Tool } from "../../types/dashboard";

/**
 * Feature: dev-tools-dashboard, Property 24: Context menu pin option
 * Validates: Requirements 8.1
 *
 * Property: For any tool card, when right-clicked, a context menu should appear
 * containing a "Pin" or "Unpin" option (depending on current pin state)
 */
describe("Property 24: Context menu pin option", () => {
  // Generator for tool data
  const toolArbitrary = fc.record({
    id: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    description: fc.string({ minLength: 1 }),
    icon: fc.string({ minLength: 1 }),
    category: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
  });

  it("should call onPin when right-clicking an unpinned tool", () => {
    fc.assert(
      fc.property(toolArbitrary, (toolData) => {
        // Arrange: Create a tool with the generated data
        const tool: Tool = {
          ...toolData,
          component: () => <div>Test Component</div>,
        };

        const onPin = vi.fn();
        const onUnpin = vi.fn();
        const onSelect = vi.fn();

        // Render the tool card as unpinned
        const { container } = render(
          <ToolCard
            tool={tool}
            isPinned={false}
            isRecentlyUsed={false}
            onSelect={onSelect}
            onPin={onPin}
            onUnpin={onUnpin}
          />
        );

        const toolCard = container.querySelector(".tool-card");
        expect(toolCard).not.toBeNull();

        // Act: Right-click the tool card (trigger context menu)
        if (toolCard) {
          fireEvent.contextMenu(toolCard);
        }

        // Assert: onPin should be called (pin option selected)
        expect(onPin).toHaveBeenCalledTimes(1);
        expect(onUnpin).not.toHaveBeenCalled();
        expect(onSelect).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  it("should call onUnpin when right-clicking a pinned tool", () => {
    fc.assert(
      fc.property(toolArbitrary, (toolData) => {
        // Arrange: Create a tool with the generated data
        const tool: Tool = {
          ...toolData,
          component: () => <div>Test Component</div>,
        };

        const onPin = vi.fn();
        const onUnpin = vi.fn();
        const onSelect = vi.fn();

        // Render the tool card as pinned
        const { container } = render(
          <ToolCard
            tool={tool}
            isPinned={true}
            isRecentlyUsed={false}
            onSelect={onSelect}
            onPin={onPin}
            onUnpin={onUnpin}
          />
        );

        const toolCard = container.querySelector(".tool-card");
        expect(toolCard).not.toBeNull();

        // Act: Right-click the tool card (trigger context menu)
        if (toolCard) {
          fireEvent.contextMenu(toolCard);
        }

        // Assert: onUnpin should be called (unpin option selected)
        expect(onUnpin).toHaveBeenCalledTimes(1);
        expect(onPin).not.toHaveBeenCalled();
        expect(onSelect).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  it("should prevent default context menu behavior", () => {
    fc.assert(
      fc.property(toolArbitrary, fc.boolean(), (toolData, isPinned) => {
        // Arrange: Create a tool with the generated data
        const tool: Tool = {
          ...toolData,
          component: () => <div>Test Component</div>,
        };

        const onPin = vi.fn();
        const onUnpin = vi.fn();
        const onSelect = vi.fn();

        // Render the tool card
        const { container } = render(
          <ToolCard
            tool={tool}
            isPinned={isPinned}
            isRecentlyUsed={false}
            onSelect={onSelect}
            onPin={onPin}
            onUnpin={onUnpin}
          />
        );

        const toolCard = container.querySelector(".tool-card");
        expect(toolCard).not.toBeNull();

        // Act: Create a context menu event and check if preventDefault is called
        if (toolCard) {
          const contextMenuEvent = new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
          });
          const preventDefaultSpy = vi.spyOn(
            contextMenuEvent,
            "preventDefault"
          );

          toolCard.dispatchEvent(contextMenuEvent);

          // Assert: preventDefault should be called to prevent browser context menu
          expect(preventDefaultSpy).toHaveBeenCalled();
        }

        // Assert: Appropriate handler should be called based on pin state
        if (isPinned) {
          expect(onUnpin).toHaveBeenCalledTimes(1);
          expect(onPin).not.toHaveBeenCalled();
        } else {
          expect(onPin).toHaveBeenCalledTimes(1);
          expect(onUnpin).not.toHaveBeenCalled();
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should toggle between pin and unpin on successive right-clicks", () => {
    fc.assert(
      fc.property(toolArbitrary, (toolData) => {
        // Arrange: Create a tool with the generated data
        const tool: Tool = {
          ...toolData,
          component: () => <div>Test Component</div>,
        };

        let isPinned = false;
        const onPin = vi.fn(() => {
          isPinned = true;
        });
        const onUnpin = vi.fn(() => {
          isPinned = false;
        });
        const onSelect = vi.fn();

        // First render: unpinned
        const { container, rerender } = render(
          <ToolCard
            tool={tool}
            isPinned={isPinned}
            isRecentlyUsed={false}
            onSelect={onSelect}
            onPin={onPin}
            onUnpin={onUnpin}
          />
        );

        const toolCard = container.querySelector(".tool-card");
        expect(toolCard).not.toBeNull();

        // Act: Right-click to pin
        if (toolCard) {
          fireEvent.contextMenu(toolCard);
        }

        // Assert: onPin should be called
        expect(onPin).toHaveBeenCalledTimes(1);
        expect(onUnpin).not.toHaveBeenCalled();

        // Rerender with pinned state
        rerender(
          <ToolCard
            tool={tool}
            isPinned={isPinned}
            isRecentlyUsed={false}
            onSelect={onSelect}
            onPin={onPin}
            onUnpin={onUnpin}
          />
        );

        // Act: Right-click again to unpin
        if (toolCard) {
          fireEvent.contextMenu(toolCard);
        }

        // Assert: onUnpin should now be called
        expect(onPin).toHaveBeenCalledTimes(1);
        expect(onUnpin).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  });
});
