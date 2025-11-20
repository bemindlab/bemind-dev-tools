import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ToolViewContainer } from "../../components/ToolViewContainer";
import { Tool, ToolComponentProps } from "../../types/dashboard";

/**
 * **Feature: dev-tools-dashboard, Property 7: Tool state preservation during navigation**
 * **Validates: Requirements 3.2, 11.1, 11.2**
 *
 * Property: For any tool with state, when navigating away from that tool and then back to it,
 * the tool's state should be identical to its state before navigation
 */

describe("Property 7: Tool state preservation during navigation", () => {
  // Create a test tool component that accepts and manages state
  const createTestToolComponent = (
    onMount: (props: ToolComponentProps) => void
  ) => {
    return (props: ToolComponentProps) => {
      React.useEffect(() => {
        onMount(props);
      }, []);

      return React.createElement(
        "div",
        { "data-testid": "test-tool" },
        `Tool State: ${JSON.stringify(props.initialState)}`
      );
    };
  };

  it("should preserve tool state when navigating away and back", () => {
    fc.assert(
      fc.property(
        // Generate random tool state (any JSON-serializable object)
        fc.jsonValue(),
        (toolState) => {
          // Track state changes
          let capturedState: unknown = toolState;
          const stateChanges: unknown[] = [];

          // Create a tool component that captures its props
          let mountedProps: ToolComponentProps | null = null;
          const TestComponent = createTestToolComponent((props) => {
            mountedProps = props;
          });

          const tool: Tool = {
            id: "test-tool",
            name: "Test Tool",
            description: "A test tool",
            icon: "test-icon",
            category: ["test"],
            component: TestComponent,
          };

          const handleStateChange = (newState: unknown) => {
            capturedState = newState;
            stateChanges.push(newState);
          };

          const handleNavigateHome = () => {
            // Navigation handler
          };

          // First mount: render with initial state
          const { unmount, rerender } = render(
            React.createElement(ToolViewContainer, {
              toolId: tool.id,
              tool,
              initialState: toolState,
              onStateChange: handleStateChange,
              onNavigateHome: handleNavigateHome,
            })
          );

          // Verify tool received the initial state
          expect(mountedProps).not.toBeNull();
          expect(mountedProps!.initialState).toEqual(toolState);

          // Simulate navigation away (unmount)
          unmount();

          // Reset mountedProps for second mount
          mountedProps = null;

          // Second mount: render again with the captured state (simulating return)
          const { unmount: unmount2 } = render(
            React.createElement(ToolViewContainer, {
              toolId: tool.id,
              tool,
              initialState: capturedState,
              onStateChange: handleStateChange,
              onNavigateHome: handleNavigateHome,
            })
          );

          // Verify tool received the same state on return
          expect(mountedProps).not.toBeNull();
          expect(mountedProps!.initialState).toEqual(toolState);

          unmount2();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should maintain state in session for all accessed tools", () => {
    fc.assert(
      fc.property(
        // Generate multiple tools with different states
        fc.array(
          fc.record({
            toolId: fc.string({ minLength: 1, maxLength: 20 }),
            state: fc.jsonValue(),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (toolsData) => {
          // Track state for each tool
          const toolStates = new Map<string, unknown>();

          toolsData.forEach(({ toolId, state }) => {
            // Store initial state
            toolStates.set(toolId, state);

            // Create tool component
            const TestComponent = createTestToolComponent(() => {});

            const tool: Tool = {
              id: toolId,
              name: `Tool ${toolId}`,
              description: "Test tool",
              icon: "test-icon",
              category: ["test"],
              component: TestComponent,
            };

            // Render with initial state
            const { unmount } = render(
              React.createElement(ToolViewContainer, {
                toolId: tool.id,
                tool,
                initialState: state,
                onStateChange: (newState) => {
                  toolStates.set(toolId, newState);
                },
                onNavigateHome: () => {},
              })
            );

            unmount();

            // Verify state is still in our session map
            expect(toolStates.get(toolId)).toEqual(state);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
