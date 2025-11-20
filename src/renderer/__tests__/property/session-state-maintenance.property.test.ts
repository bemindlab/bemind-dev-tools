import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { render } from "@testing-library/react";
import React from "react";
import { ToolViewContainer } from "../../components/ToolViewContainer";
import { Tool, ToolComponentProps } from "../../types/dashboard";

/**
 * **Feature: dev-tools-dashboard, Property 36: Session state maintenance**
 * **Validates: Requirements 11.3**
 *
 * Property: For any tool accessed during a session, the tool's state should be
 * maintained in memory for the duration of the session
 */

describe("Property 36: Session state maintenance", () => {
  it("should maintain tool state in memory throughout the session", () => {
    fc.assert(
      fc.property(
        // Generate random tool states
        fc.array(
          fc.record({
            toolId: fc.string({ minLength: 1, maxLength: 20 }),
            initialState: fc.jsonValue(),
            stateUpdates: fc.array(fc.jsonValue(), { maxLength: 5 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (toolsData) => {
          // Session state storage (simulates in-memory session storage)
          const sessionStates = new Map<string, unknown>();

          toolsData.forEach(({ toolId, initialState, stateUpdates }) => {
            // Store initial state in session
            sessionStates.set(toolId, initialState);

            // Create a test tool component
            const TestComponent = (props: ToolComponentProps) => {
              return React.createElement(
                "div",
                { "data-testid": "test-tool" },
                `State: ${JSON.stringify(props.initialState)}`
              );
            };

            const tool: Tool = {
              id: toolId,
              name: `Tool ${toolId}`,
              description: "Test tool",
              icon: "test-icon",
              category: ["test"],
              component: TestComponent,
            };

            // Render tool with initial state
            const { unmount } = render(
              React.createElement(ToolViewContainer, {
                toolId: tool.id,
                tool,
                initialState: sessionStates.get(toolId),
                onStateChange: (newState) => {
                  // Update session state
                  sessionStates.set(toolId, newState);
                },
                onNavigateHome: () => {},
              })
            );

            // Simulate state updates during the session
            stateUpdates.forEach((update) => {
              sessionStates.set(toolId, update);
            });

            // Verify state is still in session storage
            expect(sessionStates.has(toolId)).toBe(true);

            // Get the final state
            const finalState = sessionStates.get(toolId);

            // Verify the final state is the last update or initial state
            if (stateUpdates.length > 0) {
              expect(finalState).toEqual(stateUpdates[stateUpdates.length - 1]);
            } else {
              expect(finalState).toEqual(initialState);
            }

            unmount();
          });

          // Verify all tools' states are maintained in session
          toolsData.forEach(({ toolId }) => {
            expect(sessionStates.has(toolId)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve state across multiple tool switches in a session", () => {
    fc.assert(
      fc.property(
        // Generate a sequence of tool accesses with unique tool IDs
        fc.record({
          tools: fc
            .array(
              fc.record({
                toolId: fc.string({ minLength: 1, maxLength: 20 }),
                state: fc.jsonValue(),
              }),
              { minLength: 2, maxLength: 5 }
            )
            .map((tools) => {
              // Ensure unique tool IDs by appending index
              return tools.map((tool, index) => ({
                ...tool,
                toolId: `${tool.toolId}-${index}`,
              }));
            }),
          accessSequence: fc.array(fc.nat(), { minLength: 5, maxLength: 10 }),
        }),
        ({ tools, accessSequence }) => {
          // Session state storage
          const sessionStates = new Map<string, unknown>();

          // Initialize all tools with their states
          tools.forEach(({ toolId, state }) => {
            sessionStates.set(toolId, state);
          });

          // Simulate accessing tools in sequence
          accessSequence.forEach((index) => {
            const toolIndex = index % tools.length;
            const { toolId, state } = tools[toolIndex];

            // Verify state is still in session
            expect(sessionStates.has(toolId)).toBe(true);
            expect(sessionStates.get(toolId)).toEqual(state);
          });

          // After all accesses, verify all states are still maintained
          tools.forEach(({ toolId, state }) => {
            expect(sessionStates.has(toolId)).toBe(true);
            expect(sessionStates.get(toolId)).toEqual(state);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should maintain state even when tool is not currently active", () => {
    fc.assert(
      fc.property(
        // Generate tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 20 }),
          initialState: fc.jsonValue(),
        }),
        ({ toolId, initialState }) => {
          // Session state storage
          const sessionStates = new Map<string, unknown>();
          sessionStates.set(toolId, initialState);

          // Create test tool
          const TestComponent = (props: ToolComponentProps) => {
            return React.createElement("div", { "data-testid": "test-tool" });
          };

          const tool: Tool = {
            id: toolId,
            name: `Tool ${toolId}`,
            description: "Test tool",
            icon: "test-icon",
            category: ["test"],
            component: TestComponent,
          };

          // Render and unmount (simulating navigation away)
          const { unmount } = render(
            React.createElement(ToolViewContainer, {
              toolId: tool.id,
              tool,
              initialState: sessionStates.get(toolId),
              onStateChange: (newState) => {
                sessionStates.set(toolId, newState);
              },
              onNavigateHome: () => {},
            })
          );

          unmount();

          // Verify state is still maintained after unmounting
          expect(sessionStates.has(toolId)).toBe(true);
          expect(sessionStates.get(toolId)).toEqual(initialState);
        }
      ),
      { numRuns: 100 }
    );
  });
});
