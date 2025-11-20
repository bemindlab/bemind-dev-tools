import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { ToolViewContainer } from "../../components/ToolViewContainer";
import { Tool } from "../../types/dashboard";

/**
 * **Feature: dev-tools-dashboard, Property 4: Tool component rendering**
 * **Validates: Requirements 2.3**
 *
 * Property: For any tool, when navigating to that tool's view, the tool's component should be rendered and receive the correct props
 */

describe("Property 4: Tool component rendering", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should render the tool component when navigating to any tool", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
          toolDescription: fc.string({ minLength: 1, maxLength: 100 }),
          componentContent: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ toolId, toolName, toolDescription, componentContent }) => {
          try {
            const mockOnNavigateHome = vi.fn();
            const mockOnStateChange = vi.fn();

            // Create a mock tool component that renders unique content
            const MockToolComponent: React.FC = () =>
              React.createElement(
                "div",
                { "data-testid": "tool-content" },
                componentContent
              );

            const mockTool: Tool = {
              id: toolId,
              name: toolName,
              description: toolDescription,
              icon: "🔧",
              category: ["test"],
              component: MockToolComponent,
            };

            const { getByTestId } = render(
              React.createElement(ToolViewContainer, {
                toolId,
                tool: mockTool,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            // Verify the tool component is rendered
            const toolContent = getByTestId("tool-content");
            expect(toolContent).toBeInTheDocument();
            // React normalizes whitespace in text content, so we compare trimmed versions
            const actualText = toolContent.textContent || "";
            const expectedText = componentContent;
            expect(actualText.trim()).toBe(expectedText.trim());
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should pass correct props to the tool component", () => {
    fc.assert(
      fc.property(
        // Generate random tool data and initial state
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
          initialState: fc.oneof(
            fc.constant(undefined),
            fc.record({
              value: fc.string({ minLength: 1, maxLength: 50 }),
            })
          ),
        }),
        ({ toolId, toolName, initialState }) => {
          try {
            const mockOnNavigateHome = vi.fn();
            const mockOnStateChange = vi.fn();

            // Create a mock tool component that verifies props
            const MockToolComponent: React.FC<any> = (props) => {
              return React.createElement(
                "div",
                { "data-testid": "tool-content" },
                React.createElement(
                  "div",
                  { "data-testid": "is-active" },
                  String(props.isActive)
                ),
                React.createElement(
                  "div",
                  { "data-testid": "has-state-change" },
                  String(typeof props.onStateChange === "function")
                ),
                React.createElement(
                  "div",
                  { "data-testid": "initial-state" },
                  JSON.stringify(props.initialState || null)
                )
              );
            };

            const mockTool: Tool = {
              id: toolId,
              name: toolName,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: MockToolComponent,
            };

            const { getByTestId } = render(
              React.createElement(ToolViewContainer, {
                toolId,
                tool: mockTool,
                initialState,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            // Verify props are passed correctly
            expect(getByTestId("is-active")).toHaveTextContent("true");
            expect(getByTestId("has-state-change")).toHaveTextContent("true");
            expect(getByTestId("initial-state")).toHaveTextContent(
              JSON.stringify(initialState || null)
            );
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should render different tool components for different tools", () => {
    fc.assert(
      fc.property(
        // Generate two different tools
        fc.record({
          tool1Id: fc.string({ minLength: 1, maxLength: 50 }),
          tool1Name: fc.string({ minLength: 1, maxLength: 50 }),
          tool1Content: fc.string({ minLength: 1, maxLength: 50 }),
          tool2Id: fc.string({ minLength: 1, maxLength: 50 }),
          tool2Name: fc.string({ minLength: 1, maxLength: 50 }),
          tool2Content: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({
          tool1Id,
          tool1Name,
          tool1Content,
          tool2Id,
          tool2Name,
          tool2Content,
        }) => {
          // Ensure tools are different
          if (tool1Id === tool2Id || tool1Content === tool2Content) return;

          const mockOnNavigateHome = vi.fn();
          const mockOnStateChange = vi.fn();

          // Create two different mock tool components
          const MockTool1Component: React.FC = () =>
            React.createElement(
              "div",
              { "data-testid": "tool-content" },
              tool1Content
            );

          const MockTool2Component: React.FC = () =>
            React.createElement(
              "div",
              { "data-testid": "tool-content" },
              tool2Content
            );

          const mockTool1: Tool = {
            id: tool1Id,
            name: tool1Name,
            description: "Test description 1",
            icon: "🔧",
            category: ["test"],
            component: MockTool1Component,
          };

          const mockTool2: Tool = {
            id: tool2Id,
            name: tool2Name,
            description: "Test description 2",
            icon: "🔨",
            category: ["test"],
            component: MockTool2Component,
          };

          try {
            // Render first tool
            const { getByTestId: getByTestId1 } = render(
              React.createElement(ToolViewContainer, {
                toolId: tool1Id,
                tool: mockTool1,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            // React normalizes whitespace, so compare trimmed versions
            const tool1Element = getByTestId1("tool-content");
            expect(tool1Element).toBeInTheDocument();
            expect((tool1Element.textContent || "").trim()).toBe(
              tool1Content.trim()
            );
            cleanup();

            // Render second tool
            const { getByTestId: getByTestId2 } = render(
              React.createElement(ToolViewContainer, {
                toolId: tool2Id,
                tool: mockTool2,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            const tool2Element = getByTestId2("tool-content");
            expect(tool2Element).toBeInTheDocument();
            expect((tool2Element.textContent || "").trim()).toBe(
              tool2Content.trim()
            );
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should call onStateChange when tool component updates state", () => {
    fc.assert(
      fc.property(
        // Generate random tool data and state
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
          newState: fc.record({
            value: fc.string({ minLength: 1, maxLength: 50 }),
          }),
        }),
        ({ toolId, toolName, newState }) => {
          try {
            const mockOnNavigateHome = vi.fn();
            const mockOnStateChange = vi.fn();

            // Create a mock tool component that calls onStateChange
            const MockToolComponent: React.FC<any> = (props) => {
              React.useEffect(() => {
                if (props.onStateChange) {
                  props.onStateChange(newState);
                }
              }, []);

              return React.createElement(
                "div",
                { "data-testid": "tool-content" },
                "Tool Content"
              );
            };

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

            // Verify onStateChange was called with the new state
            expect(mockOnStateChange).toHaveBeenCalled();
            expect(mockOnStateChange).toHaveBeenCalledWith(newState);
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
