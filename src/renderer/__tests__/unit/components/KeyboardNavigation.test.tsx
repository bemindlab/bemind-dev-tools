import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HomePage } from "../../../components/HomePage";
import { ToolViewContainer } from "../../../components/ToolViewContainer";
import { Tool, ToolComponentProps } from "../../../types/dashboard";
import React from "react";

// Mock tool component
const MockToolComponent: React.FC<ToolComponentProps> = () => (
  <div>Mock Tool Content</div>
);

const createMockTool = (
  id: string,
  name: string,
  categories: string[]
): Tool => ({
  id,
  name,
  description: `Description for ${name}`,
  icon: "🔧",
  category: categories,
  component: MockToolComponent,
  features: [`Feature 1 for ${name}`, `Feature 2 for ${name}`],
});

describe("Keyboard Navigation", () => {
  const mockTools: Tool[] = [
    createMockTool("tool1", "Tool One", ["networking"]),
    createMockTool("tool2", "Tool Two", ["api"]),
    createMockTool("tool3", "Tool Three", ["networking"]),
    createMockTool("tool4", "Tool Four", ["monitoring"]),
  ];

  let mockOnToolSelect: ReturnType<typeof vi.fn>;
  let mockOnToolPin: ReturnType<typeof vi.fn>;
  let mockOnToolUnpin: ReturnType<typeof vi.fn>;
  let mockOnNavigateHome: ReturnType<typeof vi.fn>;
  let mockOnStateChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnToolSelect = vi.fn();
    mockOnToolPin = vi.fn();
    mockOnToolUnpin = vi.fn();
    mockOnNavigateHome = vi.fn();
    mockOnStateChange = vi.fn();
  });

  describe("HomePage Keyboard Navigation", () => {
    describe("Cmd/Ctrl+H Shortcut (Requirement 3.5)", () => {
      it("should handle Cmd+H on macOS to navigate home", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Simulate Cmd+H (metaKey for macOS)
        fireEvent.keyDown(container.firstChild as Element, {
          key: "h",
          metaKey: true,
        });

        // On home page, this is a no-op but should not cause errors
        expect(mockOnToolSelect).not.toHaveBeenCalled();
      });

      it("should handle Ctrl+H on Windows/Linux to navigate home", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Simulate Ctrl+H (ctrlKey for Windows/Linux)
        fireEvent.keyDown(container.firstChild as Element, {
          key: "h",
          ctrlKey: true,
        });

        // On home page, this is a no-op but should not cause errors
        expect(mockOnToolSelect).not.toHaveBeenCalled();
      });
    });

    describe("Enter Key Opens Tool (Requirement 10.2)", () => {
      it("should open focused tool when Enter is pressed", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Get the first tool card and press Enter on it
        const toolCards = container.querySelectorAll(".tool-card");
        const firstCard = toolCards[0] as HTMLElement;
        firstCard.focus();
        fireEvent.keyDown(firstCard, {
          key: "Enter",
        });

        expect(mockOnToolSelect).toHaveBeenCalledWith("tool1");
      });

      it("should open correct tool after navigation with arrow keys", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Navigate right to second tool
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowRight",
        });

        // Get the focused card and press Enter on it
        const focusedCard = document.activeElement as HTMLElement;
        if (focusedCard && focusedCard.classList.contains("tool-card")) {
          fireEvent.keyDown(focusedCard, {
            key: "Enter",
          });
        }

        expect(mockOnToolSelect).toHaveBeenCalledWith("tool2");
      });
    });

    describe("Arrow Key Navigation (Requirement 10.5)", () => {
      it("should navigate right with ArrowRight key", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Navigate right
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowRight",
        });

        // Open the now-focused tool (should be tool2)
        const focusedCard = document.activeElement as HTMLElement;
        if (focusedCard && focusedCard.classList.contains("tool-card")) {
          fireEvent.keyDown(focusedCard, {
            key: "Enter",
          });
        }

        expect(mockOnToolSelect).toHaveBeenCalledWith("tool2");
      });

      it("should navigate left with ArrowLeft key", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Navigate right twice
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowRight",
        });
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowRight",
        });

        // Navigate left once
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowLeft",
        });

        // Open the now-focused tool (should be tool2)
        const focusedCard = document.activeElement as HTMLElement;
        if (focusedCard && focusedCard.classList.contains("tool-card")) {
          fireEvent.keyDown(focusedCard, {
            key: "Enter",
          });
        }

        expect(mockOnToolSelect).toHaveBeenCalledWith("tool2");
      });

      it("should not navigate left beyond first tool", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Try to navigate left from first tool
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowLeft",
        });

        // Should still be on first tool
        const focusedCard = document.activeElement as HTMLElement;
        if (focusedCard && focusedCard.classList.contains("tool-card")) {
          fireEvent.keyDown(focusedCard, {
            key: "Enter",
          });
        }

        expect(mockOnToolSelect).toHaveBeenCalledWith("tool1");
      });

      it("should not navigate right beyond last tool", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Navigate to last tool
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowRight",
        });
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowRight",
        });
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowRight",
        });

        // Try to navigate right beyond last tool
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowRight",
        });

        // Should still be on last tool
        const focusedCard = document.activeElement as HTMLElement;
        if (focusedCard && focusedCard.classList.contains("tool-card")) {
          fireEvent.keyDown(focusedCard, {
            key: "Enter",
          });
        }

        expect(mockOnToolSelect).toHaveBeenCalledWith("tool4");
      });

      it("should navigate down with ArrowDown key", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Navigate down (moves by grid columns)
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowDown",
        });

        // The exact tool depends on grid layout, but it should navigate
        const focusedCard = document.activeElement as HTMLElement;
        if (focusedCard && focusedCard.classList.contains("tool-card")) {
          fireEvent.keyDown(focusedCard, {
            key: "Enter",
          });
        }

        // Should have called onToolSelect with some tool
        expect(mockOnToolSelect).toHaveBeenCalled();
      });

      it("should navigate up with ArrowUp key", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Navigate down first
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowDown",
        });

        // Navigate up
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowUp",
        });

        // Should be back at first tool
        const focusedCard = document.activeElement as HTMLElement;
        if (focusedCard && focusedCard.classList.contains("tool-card")) {
          fireEvent.keyDown(focusedCard, {
            key: "Enter",
          });
        }

        expect(mockOnToolSelect).toHaveBeenCalledWith("tool1");
      });

      it("should not navigate up beyond first row", () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Try to navigate up from first tool
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowUp",
        });

        // Should still be on first tool
        const focusedCard = document.activeElement as HTMLElement;
        if (focusedCard && focusedCard.classList.contains("tool-card")) {
          fireEvent.keyDown(focusedCard, {
            key: "Enter",
          });
        }

        expect(mockOnToolSelect).toHaveBeenCalledWith("tool1");
      });
    });

    describe("Keyboard Navigation with Empty Tools", () => {
      it("should handle keyboard events gracefully when no tools are available", () => {
        const { container } = render(
          <HomePage
            tools={[]}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Try various keyboard actions
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowRight",
        });
        fireEvent.keyDown(container.firstChild as Element, {
          key: "Enter",
        });

        // Should not call onToolSelect
        expect(mockOnToolSelect).not.toHaveBeenCalled();
      });
    });

    describe("Keyboard Navigation with Filtered Tools", () => {
      it("should navigate only through filtered tools", async () => {
        const { container } = render(
          <HomePage
            tools={mockTools}
            pinnedToolIds={[]}
            recentlyUsedToolIds={[]}
            onToolSelect={mockOnToolSelect}
            onToolPin={mockOnToolPin}
            onToolUnpin={mockOnToolUnpin}
          />
        );

        // Filter to show only networking tools
        const networkingButton = screen.getByText("Networking");
        fireEvent.click(networkingButton);

        // Navigate and open first filtered tool
        const toolCards = container.querySelectorAll(".tool-card");
        if (toolCards.length > 0) {
          const firstCard = toolCards[0] as HTMLElement;
          firstCard.focus();
          fireEvent.keyDown(firstCard, {
            key: "Enter",
          });
        }

        // Should open a networking tool (tool1 or tool3)
        expect(mockOnToolSelect).toHaveBeenCalled();
        const calledToolId = mockOnToolSelect.mock.calls[0][0];
        expect(["tool1", "tool3"]).toContain(calledToolId);
      });
    });
  });

  describe("ToolViewContainer Keyboard Navigation", () => {
    describe("Escape Key Returns to Home (Requirement 10.3)", () => {
      it("should navigate to home when Escape is pressed", () => {
        render(
          <ToolViewContainer
            toolId="tool1"
            tool={mockTools[0]}
            onStateChange={mockOnStateChange}
            onNavigateHome={mockOnNavigateHome}
          />
        );

        // Press Escape key
        fireEvent.keyDown(window, { key: "Escape" });

        expect(mockOnNavigateHome).toHaveBeenCalled();
      });

      it("should prevent default behavior when Escape is pressed", () => {
        render(
          <ToolViewContainer
            toolId="tool1"
            tool={mockTools[0]}
            onStateChange={mockOnStateChange}
            onNavigateHome={mockOnNavigateHome}
          />
        );

        const event = new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        });

        const preventDefaultSpy = vi.spyOn(event, "preventDefault");
        window.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
      });
    });

    describe("Cmd/Ctrl+H from Tool View (Requirement 3.5)", () => {
      it("should navigate to home when Cmd+H is pressed in tool view", () => {
        render(
          <ToolViewContainer
            toolId="tool1"
            tool={mockTools[0]}
            onStateChange={mockOnStateChange}
            onNavigateHome={mockOnNavigateHome}
          />
        );

        // Press Cmd+H
        fireEvent.keyDown(window, { key: "h", metaKey: true });

        expect(mockOnNavigateHome).toHaveBeenCalled();
      });

      it("should navigate to home when Ctrl+H is pressed in tool view", () => {
        render(
          <ToolViewContainer
            toolId="tool1"
            tool={mockTools[0]}
            onStateChange={mockOnStateChange}
            onNavigateHome={mockOnNavigateHome}
          />
        );

        // Press Ctrl+H
        fireEvent.keyDown(window, { key: "h", ctrlKey: true });

        expect(mockOnNavigateHome).toHaveBeenCalled();
      });

      it("should prevent default behavior when Cmd/Ctrl+H is pressed", () => {
        render(
          <ToolViewContainer
            toolId="tool1"
            tool={mockTools[0]}
            onStateChange={mockOnStateChange}
            onNavigateHome={mockOnNavigateHome}
          />
        );

        const event = new KeyboardEvent("keydown", {
          key: "h",
          metaKey: true,
          bubbles: true,
          cancelable: true,
        });

        const preventDefaultSpy = vi.spyOn(event, "preventDefault");
        window.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
      });
    });

    describe("Keyboard Event Cleanup", () => {
      it("should remove keyboard event listeners on unmount", () => {
        const { unmount } = render(
          <ToolViewContainer
            toolId="tool1"
            tool={mockTools[0]}
            onStateChange={mockOnStateChange}
            onNavigateHome={mockOnNavigateHome}
          />
        );

        // Unmount the component
        unmount();

        // Press Escape after unmount
        fireEvent.keyDown(window, { key: "Escape" });

        // Should not call onNavigateHome after unmount
        expect(mockOnNavigateHome).not.toHaveBeenCalled();
      });
    });
  });

  describe("Tab Navigation (Requirement 10.1)", () => {
    it("should allow Tab key to move focus between tool cards", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      // Get all tool cards
      const toolCards = screen
        .getAllByText(/Tool/)
        .map((el) => el.closest(".tool-card"))
        .filter((el): el is HTMLElement => el !== null);

      expect(toolCards.length).toBeGreaterThan(0);

      // Verify tool cards are focusable (have tabIndex)
      toolCards.forEach((card) => {
        expect(card.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it("should maintain logical tab order for tool cards", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      // Get all tool cards
      const toolCards = screen
        .getAllByText(/Tool/)
        .map((el) => el.closest(".tool-card"))
        .filter((el): el is HTMLElement => el !== null);

      // Verify cards have sequential or equal tabIndex values
      const tabIndices = toolCards.map((card) => card.tabIndex);
      expect(tabIndices.every((index) => index >= 0)).toBe(true);
    });
  });

  describe("Combined Keyboard Navigation Scenarios", () => {
    it("should handle multiple keyboard shortcuts in sequence", () => {
      const { container } = render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      // Navigate right
      fireEvent.keyDown(container.firstChild as Element, {
        key: "ArrowRight",
      });

      // Navigate down
      fireEvent.keyDown(container.firstChild as Element, {
        key: "ArrowDown",
      });

      // Navigate left
      fireEvent.keyDown(container.firstChild as Element, {
        key: "ArrowLeft",
      });

      // Get the focused tool card and press Enter on it
      const focusedCard = document.activeElement as HTMLElement;
      if (focusedCard && focusedCard.classList.contains("tool-card")) {
        fireEvent.keyDown(focusedCard, {
          key: "Enter",
        });
      }

      // Should have opened a tool
      expect(mockOnToolSelect).toHaveBeenCalled();
    });

    it("should handle rapid keyboard navigation", () => {
      const { container } = render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      // Rapid navigation
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(container.firstChild as Element, {
          key: "ArrowRight",
        });
      }

      // Get the focused tool card and press Enter on it
      const focusedCard = document.activeElement as HTMLElement;
      if (focusedCard && focusedCard.classList.contains("tool-card")) {
        fireEvent.keyDown(focusedCard, {
          key: "Enter",
        });
      }

      // Should have opened the last tool (bounded by array length)
      expect(mockOnToolSelect).toHaveBeenCalledWith("tool4");
    });
  });
});
