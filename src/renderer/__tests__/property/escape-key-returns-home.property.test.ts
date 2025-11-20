import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { ToolViewContainer } from "../../components/ToolViewContainer";
import { Tool } from "../../types/dashboard";

/**
 * **Feature: dev-tools-dashboard, Property 33: Escape key returns to home**
 * **Validates: Requirements 10.3**
 *
 * Property: For any tool view, pressing Escape should navigate back to the home page
 */

describe("Property 33: Escape key returns to home", () => {
  it("should navigate to home when Escape is pressed in any tool view", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 20 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
          toolDescription: fc.string({ minLength: 1, maxLength: 100 }),
          toolIcon: fc.string({ minLength: 1, maxLength: 5 }),
          toolCategory: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            minLength: 1,
            maxLength: 3,
          }),
        }),
        ({ toolId, toolName, toolDescription, toolIcon, toolCategory }) => {
          const mockOnNavigateHome = vi.fn();
          const mockOnStateChange = vi.fn();

          const MockToolComponent: React.FC = () =>
            React.createElement("div", null, "Mock Tool Content");

          const mockTool: Tool = {
            id: toolId,
            name: toolName,
            description: toolDescription,
            icon: toolIcon,
            category: toolCategory,
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

          // Verify navigation to home was triggered
          expect(mockOnNavigateHome).toHaveBeenCalled();
          expect(mockOnNavigateHome).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should only navigate once even if Escape is pressed multiple times", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 20 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        // Generate number of times to press Escape
        fc.integer({ min: 1, max: 5 }),
        ({ toolId, toolName }, escapeCount) => {
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

          // Press Escape multiple times
          for (let i = 0; i < escapeCount; i++) {
            fireEvent.keyDown(window, { key: "Escape" });
          }

          // Verify navigation was called the same number of times
          expect(mockOnNavigateHome).toHaveBeenCalledTimes(escapeCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
