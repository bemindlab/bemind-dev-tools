import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { ToolViewContainer } from "../../components/ToolViewContainer";
import { Tool } from "../../types/dashboard";

/**
 * **Feature: dev-tools-dashboard, Property 5: Navigation controls presence**
 * **Validates: Requirements 2.5**
 *
 * Property: For any active tool view, the navigation UI should include either a back button or home button
 */

describe("Property 5: Navigation controls presence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should display navigation controls (home button) for any tool view", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
          toolDescription: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        ({ toolId, toolName, toolDescription }) => {
          try {
            const mockOnNavigateHome = vi.fn();
            const mockOnStateChange = vi.fn();

            const MockToolComponent: React.FC = () =>
              React.createElement("div", null, "Tool Content");

            const mockTool: Tool = {
              id: toolId,
              name: toolName,
              description: toolDescription,
              icon: "🔧",
              category: ["test"],
              component: MockToolComponent,
            };

            const { container } = render(
              React.createElement(ToolViewContainer, {
                toolId,
                tool: mockTool,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            // Verify breadcrumb navigation is present
            const breadcrumb = container.querySelector(
              ".breadcrumb-navigation"
            );
            expect(breadcrumb).toBeInTheDocument();

            // Verify home button is present
            const homeButton = container.querySelector(
              'button[aria-label="Navigate to home"]'
            );
            expect(homeButton).toBeInTheDocument();
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should have clickable home button in navigation controls", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ toolId, toolName }) => {
          try {
            const mockOnNavigateHome = vi.fn();
            const mockOnStateChange = vi.fn();

            const MockToolComponent: React.FC = () =>
              React.createElement("div", null, "Tool Content");

            const mockTool: Tool = {
              id: toolId,
              name: toolName,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: MockToolComponent,
            };

            const { container } = render(
              React.createElement(ToolViewContainer, {
                toolId,
                tool: mockTool,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            // Find and click the home button
            const homeButton = container.querySelector(
              'button[aria-label="Navigate to home"]'
            ) as HTMLButtonElement;
            expect(homeButton).toBeInTheDocument();

            // Click the button
            homeButton.click();

            // Verify onNavigateHome was called
            expect(mockOnNavigateHome).toHaveBeenCalled();
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should display breadcrumb with tool name in navigation controls", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ toolId, toolName }) => {
          try {
            const mockOnNavigateHome = vi.fn();
            const mockOnStateChange = vi.fn();

            const MockToolComponent: React.FC = () =>
              React.createElement("div", null, "Tool Content");

            const mockTool: Tool = {
              id: toolId,
              name: toolName,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: MockToolComponent,
            };

            const { container } = render(
              React.createElement(ToolViewContainer, {
                toolId,
                tool: mockTool,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            // Verify breadcrumb contains tool name
            const breadcrumb = container.querySelector(
              ".breadcrumb-navigation"
            );
            expect(breadcrumb).toBeInTheDocument();
            expect(breadcrumb?.textContent).toContain(toolName);
            expect(breadcrumb?.textContent).toContain("Home");
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should have accessible navigation controls with proper ARIA labels", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ toolId, toolName }) => {
          try {
            const mockOnNavigateHome = vi.fn();
            const mockOnStateChange = vi.fn();

            const MockToolComponent: React.FC = () =>
              React.createElement("div", null, "Tool Content");

            const mockTool: Tool = {
              id: toolId,
              name: toolName,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: MockToolComponent,
            };

            const { container } = render(
              React.createElement(ToolViewContainer, {
                toolId,
                tool: mockTool,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            // Verify breadcrumb has proper ARIA label
            const breadcrumb = container.querySelector(
              'nav[aria-label="Breadcrumb"]'
            );
            expect(breadcrumb).toBeInTheDocument();

            // Verify home button has proper ARIA label
            const homeButton = container.querySelector(
              'button[aria-label="Navigate to home"]'
            );
            expect(homeButton).toBeInTheDocument();
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
