import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { ToolViewContainer } from "../../components/ToolViewContainer";
import { Tool } from "../../types/dashboard";

/**
 * **Feature: dev-tools-dashboard, Property 9: Keyboard shortcut home navigation**
 * **Validates: Requirements 3.5**
 *
 * Property: For any view state, when the Cmd/Ctrl+H keyboard shortcut is triggered,
 * the dashboard should navigate to the home page
 */

describe("Property 9: Keyboard shortcut home navigation", () => {
  it("should navigate to home when Cmd+H is pressed in tool view", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 20 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
          toolDescription: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        ({ toolId, toolName, toolDescription }) => {
          const mockOnNavigateHome = vi.fn();
          const mockOnStateChange = vi.fn();

          const MockToolComponent: React.FC = () =>
            React.createElement("div", null, "Mock Tool Content");

          const mockTool: Tool = {
            id: toolId,
            name: toolName,
            description: toolDescription,
            icon: "🔧",
            category: ["test"],
            component: MockToolComponent,
          };

          render(
            React.createElement(ToolViewContainer, {
              toolId,
              tool: mockTool,
              onStateChange: mockOnStateChange,
              onNavigateHome: mockOnNavigateHome,
            })
          );

          // Simulate Cmd+H (Mac)
          fireEvent.keyDown(window, { key: "h", metaKey: true });

          // Verify navigation was triggered
          expect(mockOnNavigateHome).toHaveBeenCalled();

          // Reset for next test
          mockOnNavigateHome.mockClear();

          // Simulate Ctrl+H (Windows/Linux)
          fireEvent.keyDown(window, { key: "h", ctrlKey: true });

          // Verify navigation was triggered again
          expect(mockOnNavigateHome).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should navigate to home when Escape is pressed in tool view", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 20 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ toolId, toolName }) => {
          const mockOnNavigateHome = vi.fn();
          const mockOnStateChange = vi.fn();

          const MockToolComponent: React.FC = () =>
            React.createElement("div", null, "Mock Tool Content");

          const mockTool: Tool = {
            id: toolId,
            name: toolName,
            description: "Test description",
            icon: "🔧",
            category: ["test"],
            component: MockToolComponent,
          };

          render(
            React.createElement(ToolViewContainer, {
              toolId,
              tool: mockTool,
              onStateChange: mockOnStateChange,
              onNavigateHome: mockOnNavigateHome,
            })
          );

          // Simulate Escape key
          fireEvent.keyDown(window, { key: "Escape" });

          // Verify navigation was triggered
          expect(mockOnNavigateHome).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});
